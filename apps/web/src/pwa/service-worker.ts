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
  retryReadiness(): boolean;
  retryUpdate(): Promise<boolean>;
  close(): void;
}

interface ServiceWorkerLike {
  postMessage(message: unknown): void;
}

interface ServiceWorkerContainerLike {
  readonly controller: ServiceWorkerLike | null;
  register(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration>;
  addEventListener(type: 'controllerchange', listener: () => void): void;
  removeEventListener(type: 'controllerchange', listener: () => void): void;
  addEventListener(
    type: 'message',
    listener: (event: { readonly data: unknown; readonly source?: unknown }) => void,
  ): void;
  removeEventListener(
    type: 'message',
    listener: (event: { readonly data: unknown; readonly source?: unknown }) => void,
  ): void;
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
  options: { readonly readinessTimeoutMs?: number } = {},
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
  const readinessTimeoutMs = options.readinessTimeoutMs ?? 5_000;
  const readinessClientId =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let readinessSequence = 0;
  let pendingReadiness:
    | {
        readonly requestId: string;
        readonly controller: ServiceWorkerLike;
        timeout: ReturnType<typeof setTimeout>;
      }
    | undefined;

  const publish = (next: PwaLifecycleStatus) => {
    if (closed) return;
    status = next;
    listeners.forEach((listener) => listener(status));
  };

  const clearReadiness = () => {
    if (pendingReadiness) clearTimeout(pendingReadiness.timeout);
    pendingReadiness = undefined;
  };

  const requestReadinessCheck = (): boolean => {
    if (!serviceWorker?.controller || status.updateStatus === 'reload-required') return false;
    clearReadiness();
    const controller = serviceWorker.controller;
    const requestId = `${readinessClientId}:${++readinessSequence}`;
    publish({ ...status, offlineReadiness: 'installing' });
    const timeout = setTimeout(() => {
      if (pendingReadiness?.requestId !== requestId) return;
      pendingReadiness = undefined;
      publish({ ...status, offlineReadiness: 'unavailable' });
    }, readinessTimeoutMs);
    pendingReadiness = { requestId, controller, timeout };
    try {
      controller.postMessage({ type: CHECK_OFFLINE_READINESS_MESSAGE, requestId });
    } catch {
      clearReadiness();
      publish({ ...status, offlineReadiness: 'unavailable' });
      return false;
    }
    return true;
  };

  const readinessResult = (event: { readonly data: unknown; readonly source?: unknown }) => {
    if (!isOfflineReadinessResultMessage(event.data)) return;
    if (
      !pendingReadiness ||
      status.updateStatus === 'reload-required' ||
      event.source !== pendingReadiness.controller ||
      event.data.requestId !== pendingReadiness.requestId
    )
      return;
    clearReadiness();
    publish({
      ...status,
      offlineReadiness: event.data.ready ? 'ready' : 'unavailable',
    });
  };

  const controllerChanged = () => {
    clearReadiness();
    publish({ ...status, offlineReadiness: 'not-checked', updateStatus: 'reload-required' });
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
    retryReadiness: requestReadinessCheck,
    async retryUpdate() {
      if (closed || !registration || typeof registration.update !== 'function') return false;
      try {
        publish({ ...status, updateStatus: 'pending' });
        await registration.update();
        if (!registration.installing && !registration.waiting) {
          publish({ ...status, updateStatus: 'not-checked' });
        }
        return true;
      } catch {
        publish({ ...status, updateStatus: 'failed' });
        return false;
      }
    },
    close() {
      if (closed) return;
      closed = true;
      clearReadiness();
      serviceWorker?.removeEventListener?.('controllerchange', controllerChanged);
      serviceWorker?.removeEventListener?.('message', readinessResult);
      registration?.removeEventListener('updatefound', observeInstallingWorker);
      listeners.clear();
    },
  };
}
