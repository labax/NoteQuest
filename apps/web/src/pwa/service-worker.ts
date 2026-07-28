import {
  ACTIVATE_UPDATE_MESSAGE,
  CHECK_OFFLINE_READINESS_MESSAGE,
  isOfflineReadinessResultMessage,
} from './protocol';

export { ACTIVATE_UPDATE_MESSAGE } from './protocol';

export type ServiceWorkerSupport = 'supported' | 'unsupported';
export type OfflineReadiness = 'not-checked' | 'installing' | 'ready' | 'unavailable';
export type UpdateStatus =
  'not-checked' | 'pending' | 'waiting' | 'activation-requested' | 'reload-required' | 'failed';

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
  readonly controller: { postMessage(message: unknown): void } | null;
  register(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration>;
  addEventListener(type: 'controllerchange', listener: () => void): void;
  removeEventListener(type: 'controllerchange', listener: () => void): void;
  addEventListener(type: 'message', listener: (event: { readonly data: unknown }) => void): void;
  removeEventListener(type: 'message', listener: (event: { readonly data: unknown }) => void): void;
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

  const requestReadinessCheck = () => {
    if (!serviceWorker?.controller) return;
    publish({ ...status, offlineReadiness: 'installing' });
    serviceWorker.controller.postMessage({ type: CHECK_OFFLINE_READINESS_MESSAGE });
  };

  const readinessResult = (event: { readonly data: unknown }) => {
    if (!isOfflineReadinessResultMessage(event.data)) return;
    publish({
      ...status,
      offlineReadiness: event.data.ready ? 'ready' : 'unavailable',
    });
  };

  const controllerChanged = () => {
    publish({ ...status, offlineReadiness: 'not-checked', updateStatus: 'reload-required' });
    requestReadinessCheck();
  };

  const observeInstallingWorker = () => {
    const installing = registration?.installing;
    if (!installing) return;
    if (installing.state === 'installing' && serviceWorker?.controller) {
      publish({ ...status, updateStatus: 'pending' });
    }
    if (installing.state === 'installed' && registration?.waiting) {
      publish({ ...status, updateStatus: 'waiting' });
    }
    if (observedWorkers.has(installing)) return;
    observedWorkers.add(installing);
    installing.addEventListener('statechange', () => {
      if (installing.state === 'redundant') {
        publish({ ...status, updateStatus: 'failed' });
        return;
      }
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
          serviceWorker.addEventListener?.('message', readinessResult);
          publish({
            ...status,
            offlineReadiness: serviceWorker.controller ? 'not-checked' : 'installing',
            updateStatus: registration.waiting ? 'waiting' : 'not-checked',
          });
          observeInstallingWorker();
          requestReadinessCheck();
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
      serviceWorker?.removeEventListener?.('message', readinessResult);
      registration?.removeEventListener('updatefound', observeInstallingWorker);
      listeners.clear();
    },
  };
}
