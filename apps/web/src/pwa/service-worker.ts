import { ACTIVATE_UPDATE_MESSAGE } from './protocol';

export { ACTIVATE_UPDATE_MESSAGE } from './protocol';

export type ServiceWorkerSupport = 'supported' | 'unsupported';
export type OfflineReadiness = 'not-checked' | 'installing' | 'ready' | 'unavailable';
export type UpdateStatus = 'not-checked' | 'current' | 'waiting' | 'activation-requested';

export interface PwaLifecycleStatus {
  readonly serviceWorkerSupport: ServiceWorkerSupport;
  readonly offlineReadiness: OfflineReadiness;
  readonly updateStatus: UpdateStatus;
}

export interface PwaLifecycleAdapter {
  getStatus(): Readonly<PwaLifecycleStatus>;
  register(): Promise<void>;
  subscribe(listener: (status: Readonly<PwaLifecycleStatus>) => void): () => void;
  requestActivation(activationIsSafe: boolean): boolean;
  close(): void;
}

interface ServiceWorkerContainerLike {
  readonly controller: unknown;
  register(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration>;
  addEventListener(type: 'controllerchange', listener: () => void): void;
  removeEventListener(type: 'controllerchange', listener: () => void): void;
}

interface PwaEnvironment {
  readonly serviceWorker?: Partial<ServiceWorkerContainerLike>;
}

const unsupportedStatus: PwaLifecycleStatus = {
  serviceWorkerSupport: 'unsupported',
  offlineReadiness: 'unavailable',
  updateStatus: 'not-checked',
};

export function createPwaLifecycleAdapter(
  environment: PwaEnvironment = navigator,
): PwaLifecycleAdapter {
  const serviceWorker = environment.serviceWorker;
  const registrationSupported = typeof serviceWorker?.register === 'function';
  let status: PwaLifecycleStatus = registrationSupported
    ? {
        serviceWorkerSupport: 'supported',
        offlineReadiness: 'not-checked',
        updateStatus: 'not-checked',
      }
    : unsupportedStatus;
  let registration: ServiceWorkerRegistration | undefined;
  let registrationRequest: Promise<void> | undefined;
  let closed = false;
  const listeners = new Set<(status: Readonly<PwaLifecycleStatus>) => void>();
  const observedWorkers = new WeakSet<ServiceWorker>();

  const publish = (next: PwaLifecycleStatus) => {
    if (closed) return;
    status = next;
    listeners.forEach((listener) => listener(status));
  };

  const controllerChanged = () => {
    publish({ ...status, offlineReadiness: 'ready', updateStatus: 'current' });
  };

  const observeInstallingWorker = () => {
    const installing = registration?.installing;
    if (!installing) return;
    if (installing.state === 'installed' && registration?.waiting) {
      publish({ ...status, updateStatus: 'waiting' });
    }
    if (observedWorkers.has(installing)) return;
    observedWorkers.add(installing);
    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && registration?.waiting) {
        publish({ ...status, updateStatus: 'waiting' });
      }
    });
  };

  return {
    getStatus: () => status,
    subscribe(listener) {
      if (closed) return () => undefined;
      listeners.add(listener);
      listener(status);
      return () => listeners.delete(listener);
    },
    register() {
      if (!registrationSupported || !serviceWorker || closed) return Promise.resolve();
      if (registrationRequest) return registrationRequest;

      registrationRequest = (async () => {
        publish({ ...status, offlineReadiness: 'installing' });
        try {
          registration = await serviceWorker.register!('/sw.js', {
            scope: '/',
            type: 'classic',
          });
          if (closed) return;
          registration.addEventListener('updatefound', observeInstallingWorker);
          serviceWorker.addEventListener?.('controllerchange', controllerChanged);
          publish({
            ...status,
            offlineReadiness: serviceWorker.controller ? 'ready' : 'installing',
            updateStatus: registration.waiting ? 'waiting' : 'current',
          });
          observeInstallingWorker();
        } catch {
          publish({ ...status, offlineReadiness: 'unavailable', updateStatus: 'not-checked' });
        }
      })();
      return registrationRequest;
    },
    requestActivation(activationIsSafe) {
      if (closed || !activationIsSafe || !registration?.waiting) return false;
      registration.waiting.postMessage({ type: ACTIVATE_UPDATE_MESSAGE });
      publish({ ...status, updateStatus: 'activation-requested' });
      return true;
    },
    close() {
      if (closed) return;
      closed = true;
      serviceWorker?.removeEventListener?.('controllerchange', controllerChanged);
      registration?.removeEventListener('updatefound', observeInstallingWorker);
      listeners.clear();
    },
  };
}
