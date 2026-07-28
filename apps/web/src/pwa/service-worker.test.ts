import { describe, expect, it, vi } from 'vitest';
import { ACTIVATE_UPDATE_MESSAGE, createPwaLifecycleAdapter } from './service-worker';

function registration(waiting: ServiceWorker | null = null): ServiceWorkerRegistration {
  return {
    waiting,
    installing: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as ServiceWorkerRegistration;
}

function serviceWorkerEnvironment(
  register = vi.fn(),
  controller: { postMessage(message: unknown): void } | null = null,
) {
  return {
    serviceWorker: {
      controller,
      register,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  };
}

describe('PWA lifecycle adapter', () => {
  it('reports unsupported environments without attempting registration', async () => {
    const adapter = createPwaLifecycleAdapter({});
    await adapter.register();
    expect(adapter.getStatus()).toEqual({
      serviceWorkerSupport: 'unsupported',
      offlineReadiness: 'unavailable',
      updateStatus: 'not-checked',
    });
  });

  it('contains registration failure without blocking browser play', async () => {
    const adapter = createPwaLifecycleAdapter(
      serviceWorkerEnvironment(vi.fn().mockRejectedValue(new Error('disabled'))),
    );
    await expect(adapter.register()).resolves.toBeUndefined();
    expect(adapter.getStatus().offlineReadiness).toBe('unavailable');
  });

  it('only asks a waiting worker to activate after an explicit safe decision', async () => {
    const postMessage = vi.fn();
    const waiting = { postMessage } as unknown as ServiceWorker;
    const environment = serviceWorkerEnvironment(vi.fn().mockResolvedValue(registration(waiting)), {
      postMessage: vi.fn(),
    });
    const adapter = createPwaLifecycleAdapter(environment);
    await adapter.register();

    expect(adapter.requestActivation(false)).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
    expect(adapter.requestActivation(true)).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ type: ACTIVATE_UPDATE_MESSAGE });
  });

  it('registers at most once and immediately gives subscribers the current status', async () => {
    const register = vi.fn().mockResolvedValue(registration());
    const adapter = createPwaLifecycleAdapter(serviceWorkerEnvironment(register));
    const listener = vi.fn();

    adapter.subscribe(listener);
    const first = adapter.register();
    const second = adapter.register();

    expect(first).toBe(second);
    await first;
    expect(register).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenNthCalledWith(1, {
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'not-checked',
      updateStatus: 'not-checked',
    });
    expect(listener).toHaveBeenLastCalledWith({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'installing',
      updateStatus: 'not-checked',
    });
  });

  it('publishes waiting and controlling lifecycle transitions', async () => {
    let updateFound: (() => void) | undefined;
    let stateChanged: (() => void) | undefined;
    let controllerChanged: (() => void) | undefined;
    let waiting: ServiceWorker | null = null;
    const installing = {
      state: 'installing',
      addEventListener: vi.fn((_type: string, listener: () => void) => {
        stateChanged = listener;
      }),
    };
    const registered = {
      get waiting() {
        return waiting;
      },
      installing,
      addEventListener: vi.fn((_type: string, listener: () => void) => {
        updateFound = listener;
      }),
      removeEventListener: vi.fn(),
    } as unknown as ServiceWorkerRegistration;
    const environment = serviceWorkerEnvironment(vi.fn().mockResolvedValue(registered));
    environment.serviceWorker.addEventListener.mockImplementation(
      (type: string, listener: () => void) => {
        if (type === 'controllerchange') controllerChanged = listener;
      },
    );
    const adapter = createPwaLifecycleAdapter(environment);
    await adapter.register();

    waiting = { postMessage: vi.fn() } as unknown as ServiceWorker;
    installing.state = 'installed';
    updateFound?.();
    stateChanged?.();
    expect(adapter.getStatus().updateStatus).toBe('waiting');

    controllerChanged?.();
    expect(adapter.getStatus()).toMatchObject({
      offlineReadiness: 'not-checked',
      updateStatus: 'reload-required',
    });
  });

  it('wires an updating worker through pending and failed lifecycle states', async () => {
    let updateFound: (() => void) | undefined;
    let stateChanged: (() => void) | undefined;
    const installing = {
      state: 'installing',
      addEventListener: vi.fn((_type: string, listener: () => void) => {
        stateChanged = listener;
      }),
    };
    const registered = {
      waiting: null,
      installing,
      addEventListener: vi.fn((_type: string, listener: () => void) => {
        updateFound = listener;
      }),
      removeEventListener: vi.fn(),
    } as unknown as ServiceWorkerRegistration;
    const environment = serviceWorkerEnvironment(vi.fn().mockResolvedValue(registered), {
      postMessage: vi.fn(),
    });
    const adapter = createPwaLifecycleAdapter(environment);
    await adapter.register();

    updateFound?.();
    expect(adapter.getStatus().updateStatus).toBe('pending');
    installing.state = 'redundant';
    stateChanged?.();
    expect(adapter.getStatus().updateStatus).toBe('failed');
    expect(adapter.getStatus().offlineReadiness).not.toBe('ready');
  });

  it('does not infer readiness or currency from an existing controller', async () => {
    const postMessage = vi.fn();
    let messageReceived:
      ((event: { readonly data: unknown; readonly source?: unknown }) => void) | undefined;
    const environment = serviceWorkerEnvironment(vi.fn().mockResolvedValue(registration()), {
      postMessage,
    });
    environment.serviceWorker.addEventListener.mockImplementation((type, listener) => {
      if (type === 'message') messageReceived = listener;
    });
    const adapter = createPwaLifecycleAdapter(environment);

    await adapter.register();

    const request = postMessage.mock.calls[0]?.[0] as { requestId: string };
    expect(request).toMatchObject({ type: 'NOTEQUEST_CHECK_OFFLINE_READINESS' });
    expect(adapter.getStatus()).toEqual({
      serviceWorkerSupport: 'supported',
      offlineReadiness: 'installing',
      updateStatus: 'not-checked',
    });
    messageReceived?.({
      source: environment.serviceWorker.controller,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: request.requestId,
        ready: true,
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('ready');
  });

  it('rejects malformed readiness messages and reports a verified cache failure', async () => {
    let messageReceived:
      ((event: { readonly data: unknown; readonly source?: unknown }) => void) | undefined;
    const controller = { postMessage: vi.fn() };
    const environment = serviceWorkerEnvironment(
      vi.fn().mockResolvedValue(registration()),
      controller,
    );
    environment.serviceWorker.addEventListener.mockImplementation((type, listener) => {
      if (type === 'message') messageReceived = listener;
    });
    const adapter = createPwaLifecycleAdapter(environment);
    await adapter.register();

    const request = controller.postMessage.mock.calls[0]?.[0] as { requestId: string };
    messageReceived?.({
      source: controller,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: request.requestId,
        ready: 'yes',
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('installing');
    messageReceived?.({
      source: controller,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: request.requestId,
        ready: false,
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('unavailable');
  });

  it('ignores unsolicited, foreign, stale, and duplicate readiness responses', async () => {
    let messageReceived:
      ((event: { readonly data: unknown; readonly source?: unknown }) => void) | undefined;
    const controller = { postMessage: vi.fn() };
    const environment = serviceWorkerEnvironment(
      vi.fn().mockResolvedValue(registration()),
      controller,
    );
    environment.serviceWorker.addEventListener.mockImplementation((type, listener) => {
      if (type === 'message') messageReceived = listener;
    });
    const adapter = createPwaLifecycleAdapter(environment);
    await adapter.register();
    const request = controller.postMessage.mock.calls[0]?.[0] as { requestId: string };

    messageReceived?.({
      source: controller,
      data: { type: 'NOTEQUEST_OFFLINE_READINESS_RESULT', requestId: 'stale', ready: true },
    });
    messageReceived?.({
      source: { postMessage: vi.fn() },
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: request.requestId,
        ready: true,
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('installing');

    messageReceived?.({
      source: controller,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: request.requestId,
        ready: false,
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('unavailable');
    messageReceived?.({
      source: controller,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: request.requestId,
        ready: true,
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('unavailable');
  });

  it('keeps controller-change readiness neutral until a fresh reloaded adapter verifies it', async () => {
    let oldMessage:
      ((event: { readonly data: unknown; readonly source?: unknown }) => void) | undefined;
    let controllerChanged: (() => void) | undefined;
    const oldController = { postMessage: vi.fn() };
    const environment = serviceWorkerEnvironment(
      vi.fn().mockResolvedValue(registration()),
      oldController,
    );
    environment.serviceWorker.addEventListener.mockImplementation((type, listener) => {
      if (type === 'message') oldMessage = listener;
      if (type === 'controllerchange') controllerChanged = listener as () => void;
    });
    const adapter = createPwaLifecycleAdapter(environment);
    await adapter.register();
    const oldRequest = oldController.postMessage.mock.calls[0]?.[0] as { requestId: string };

    controllerChanged?.();
    const newlyActivatedController = { postMessage: vi.fn() };
    environment.serviceWorker.controller = newlyActivatedController;
    oldMessage?.({
      source: oldController,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: oldRequest.requestId,
        ready: true,
      },
    });
    oldMessage?.({
      source: newlyActivatedController,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: oldRequest.requestId,
        ready: false,
      },
    });
    expect(adapter.getStatus()).toMatchObject({
      offlineReadiness: 'not-checked',
      updateStatus: 'reload-required',
    });
    expect(adapter.retryReadiness()).toBe(false);

    const freshController = { postMessage: vi.fn() };
    const freshEnvironment = serviceWorkerEnvironment(
      vi.fn().mockResolvedValue(registration()),
      freshController,
    );
    let freshMessage:
      ((event: { readonly data: unknown; readonly source?: unknown }) => void) | undefined;
    freshEnvironment.serviceWorker.addEventListener.mockImplementation((type, listener) => {
      if (type === 'message') freshMessage = listener;
    });
    const reloaded = createPwaLifecycleAdapter(freshEnvironment);
    await reloaded.register();
    const freshRequest = freshController.postMessage.mock.calls[0]?.[0] as { requestId: string };
    expect(freshRequest.requestId).not.toBe(oldRequest.requestId);
    freshMessage?.({
      source: freshController,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: freshRequest.requestId,
        ready: true,
      },
    });
    expect(reloaded.getStatus().offlineReadiness).toBe('ready');
  });

  it('times out a readiness check and succeeds after an explicit scoped retry', async () => {
    vi.useFakeTimers();
    const controller = { postMessage: vi.fn() };
    let messageReceived:
      ((event: { readonly data: unknown; readonly source?: unknown }) => void) | undefined;
    const environment = serviceWorkerEnvironment(
      vi.fn().mockResolvedValue(registration()),
      controller,
    );
    environment.serviceWorker.addEventListener.mockImplementation((type, listener) => {
      if (type === 'message') messageReceived = listener;
    });
    const adapter = createPwaLifecycleAdapter(environment, { readinessTimeoutMs: 10 });
    await adapter.register();
    await vi.advanceTimersByTimeAsync(10);
    expect(adapter.getStatus().offlineReadiness).toBe('unavailable');

    expect(adapter.retryReadiness()).toBe(true);
    const retry = controller.postMessage.mock.calls[1]?.[0] as { requestId: string };
    messageReceived?.({
      source: controller,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: retry.requestId,
        ready: true,
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('ready');
    vi.useRealTimers();
  });

  it('retries a false readiness result with a new request and can then succeed', async () => {
    const controller = { postMessage: vi.fn() };
    let messageReceived:
      ((event: { readonly data: unknown; readonly source?: unknown }) => void) | undefined;
    const environment = serviceWorkerEnvironment(
      vi.fn().mockResolvedValue(registration()),
      controller,
    );
    environment.serviceWorker.addEventListener.mockImplementation((type, listener) => {
      if (type === 'message') messageReceived = listener;
    });
    const adapter = createPwaLifecycleAdapter(environment);
    await adapter.register();
    const first = controller.postMessage.mock.calls[0]?.[0] as { requestId: string };
    messageReceived?.({
      source: controller,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: first.requestId,
        ready: false,
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('unavailable');

    expect(adapter.retryReadiness()).toBe(true);
    const second = controller.postMessage.mock.calls[1]?.[0] as { requestId: string };
    expect(second.requestId).not.toBe(first.requestId);
    messageReceived?.({
      source: controller,
      data: {
        type: 'NOTEQUEST_OFFLINE_READINESS_RESULT',
        requestId: second.requestId,
        ready: true,
      },
    });
    expect(adapter.getStatus().offlineReadiness).toBe('ready');
  });

  it('contains a rejected readiness message and remains retryable', async () => {
    const controller = {
      postMessage: vi.fn(() => {
        throw new Error('detached');
      }),
    };
    const adapter = createPwaLifecycleAdapter(
      serviceWorkerEnvironment(vi.fn().mockResolvedValue(registration()), controller),
    );
    await expect(adapter.register()).resolves.toBeUndefined();
    expect(adapter.getStatus().offlineReadiness).toBe('unavailable');
    expect(adapter.retryReadiness()).toBe(false);
    expect(adapter.getStatus().offlineReadiness).toBe('unavailable');
  });

  it('retries update checks without activation and contains rejected browser promises', async () => {
    const update = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(undefined);
    const registered = { ...registration(), update } as ServiceWorkerRegistration;
    const adapter = createPwaLifecycleAdapter(
      serviceWorkerEnvironment(vi.fn().mockResolvedValue(registered)),
    );
    await adapter.register();

    await expect(adapter.retryUpdate()).resolves.toBe(false);
    expect(adapter.getStatus().updateStatus).toBe('failed');
    await expect(adapter.retryUpdate()).resolves.toBe(true);
    expect(update).toHaveBeenCalledTimes(2);
    expect(registered.waiting).toBeNull();
  });

  it('stops lifecycle publication and removes owned listeners when closed', async () => {
    const registered = registration();
    const environment = serviceWorkerEnvironment(vi.fn().mockResolvedValue(registered));
    const adapter = createPwaLifecycleAdapter(environment);
    const listener = vi.fn();
    adapter.subscribe(listener);
    await adapter.register();

    adapter.close();

    expect(environment.serviceWorker.removeEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function),
    );
    expect(registered.removeEventListener).toHaveBeenCalledWith(
      'updatefound',
      expect.any(Function),
    );
    expect(adapter.requestActivation(true)).toBe(false);
  });
});
