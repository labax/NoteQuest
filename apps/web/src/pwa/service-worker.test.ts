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

function serviceWorkerEnvironment(register = vi.fn(), controller: unknown = null) {
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
    const environment = serviceWorkerEnvironment(
      vi.fn().mockResolvedValue(registration(waiting)),
      {},
    );
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
      updateStatus: 'current',
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
      (_type: string, listener: () => void) => {
        controllerChanged = listener;
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
      offlineReadiness: 'ready',
      updateStatus: 'current',
    });
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
