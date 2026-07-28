import { setCacheNameDetails } from 'workbox-core';
import {
  createHandlerBoundToURL,
  getCacheKeyForURL,
  precacheAndRoute,
  type PrecacheEntry,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import {
  isActivateUpdateMessage,
  isCheckOfflineReadinessMessage,
  OFFLINE_READINESS_RESULT_MESSAGE,
} from './pwa/protocol';

interface ServiceWorkerScope {
  readonly __WB_MANIFEST: Array<PrecacheEntry | string>;
  addEventListener(
    type: 'message',
    listener: (event: {
      readonly data: unknown;
      readonly source?: { postMessage(message: unknown): void } | null;
    }) => void,
  ): void;
  skipWaiting(): Promise<void>;
}

declare const self: ServiceWorkerScope;

const applicationShellUrl = 'index.html';
const precacheManifest = self.__WB_MANIFEST;

setCacheNameDetails({
  prefix: 'nq',
  precache: 'shell',
  suffix: __NOTEQUEST_RELEASE_ID__,
});

precacheAndRoute(precacheManifest);
registerRoute(new NavigationRoute(createHandlerBoundToURL(applicationShellUrl)));

async function requiredPrecacheIsReady(): Promise<boolean> {
  const requiredUrls = precacheManifest.map((entry) =>
    typeof entry === 'string' ? entry : entry.url,
  );
  if (requiredUrls.length === 0) return false;
  const matches = await Promise.all(
    requiredUrls.map((url) => {
      const cacheKey = getCacheKeyForURL(url);
      return cacheKey === undefined ? undefined : caches.match(cacheKey);
    }),
  );
  return matches.every((response) => response !== undefined);
}

// Do not call skipWaiting during installation. A new release must remain waiting until
// project-owned application code confirms a successful save point and explicit reload.
self.addEventListener('message', (event) => {
  if (isActivateUpdateMessage(event.data)) {
    void self.skipWaiting();
  }
  if (isCheckOfflineReadinessMessage(event.data)) {
    void requiredPrecacheIsReady()
      .then((ready) => event.source?.postMessage({ type: OFFLINE_READINESS_RESULT_MESSAGE, ready }))
      .catch(() =>
        event.source?.postMessage({ type: OFFLINE_READINESS_RESULT_MESSAGE, ready: false }),
      );
  }
});
