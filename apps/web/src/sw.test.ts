import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const workbox = vi.hoisted(() => ({
  createHandlerBoundToURL: vi.fn(() => vi.fn()),
  precacheAndRoute: vi.fn(),
  registerRoute: vi.fn(),
  setCacheNameDetails: vi.fn(),
}));

vi.mock('workbox-core', () => ({ setCacheNameDetails: workbox.setCacheNameDetails }));
vi.mock('workbox-precaching', () => ({
  createHandlerBoundToURL: workbox.createHandlerBoundToURL,
  precacheAndRoute: workbox.precacheAndRoute,
}));
vi.mock('workbox-routing', () => ({
  NavigationRoute: class NavigationRoute {
    constructor(readonly handler: unknown) {}
  },
  registerRoute: workbox.registerRoute,
}));

describe('custom service worker', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('precaches the injected manifest in a release-versioned shell cache', async () => {
    const manifest = [{ url: 'index.html', revision: 'shell-revision' }];
    vi.stubGlobal('__NOTEQUEST_RELEASE_ID__', 'release-test');
    vi.stubGlobal('self', {
      __WB_MANIFEST: manifest,
      addEventListener: vi.fn(),
      skipWaiting: vi.fn(),
    });

    await import('./sw');

    expect(workbox.setCacheNameDetails).toHaveBeenCalledWith({
      prefix: 'nq',
      precache: 'shell',
      suffix: 'release-test',
    });
    expect(workbox.precacheAndRoute).toHaveBeenCalledWith(manifest);
    expect(workbox.createHandlerBoundToURL).toHaveBeenCalledWith('index.html');
    expect(workbox.registerRoute).toHaveBeenCalledOnce();
  });

  it('uses distinct cache suffixes for distinct production releases', async () => {
    vi.stubGlobal('self', {
      __WB_MANIFEST: [],
      addEventListener: vi.fn(),
      skipWaiting: vi.fn(),
    });
    vi.stubGlobal('__NOTEQUEST_RELEASE_ID__', 'release-one');
    await import('./sw');
    const first = workbox.setCacheNameDetails.mock.calls.at(-1)?.[0];

    vi.resetModules();
    vi.stubGlobal('__NOTEQUEST_RELEASE_ID__', 'release-two');
    await import('./sw');
    const second = workbox.setCacheNameDetails.mock.calls.at(-1)?.[0];

    expect(first).toMatchObject({ suffix: 'release-one' });
    expect(second).toMatchObject({ suffix: 'release-two' });
    expect(first).not.toEqual(second);
  });

  it('only activates for the controlled project message', async () => {
    let onMessage: ((event: { readonly data: unknown }) => void) | undefined;
    const skipWaiting = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('__NOTEQUEST_RELEASE_ID__', 'release-test');
    vi.stubGlobal('self', {
      __WB_MANIFEST: [],
      addEventListener: vi.fn(
        (_type: string, listener: (event: { readonly data: unknown }) => void) => {
          onMessage = listener;
        },
      ),
      skipWaiting,
    });

    await import('./sw');
    onMessage?.({ data: { type: 'unrelated' } });
    expect(skipWaiting).not.toHaveBeenCalled();

    onMessage?.({ data: { type: 'NOTEQUEST_ACTIVATE_UPDATE' } });
    expect(skipWaiting).toHaveBeenCalledOnce();
  });
});
