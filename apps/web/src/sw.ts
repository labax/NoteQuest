import { setCacheNameDetails } from 'workbox-core';
import { createHandlerBoundToURL, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { isActivateUpdateMessage } from './pwa/protocol';

interface ServiceWorkerScope {
  readonly __WB_MANIFEST: Array<PrecacheEntry | string>;
  addEventListener(type: 'message', listener: (event: { readonly data: unknown }) => void): void;
  skipWaiting(): Promise<void>;
}

declare const self: ServiceWorkerScope;

const applicationShellUrl = 'index.html';

setCacheNameDetails({
  prefix: 'nq',
  precache: 'shell',
  suffix: __NOTEQUEST_RELEASE_ID__,
});

precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL(applicationShellUrl)));

// Do not call skipWaiting during installation. A new release must remain waiting until
// project-owned application code confirms a successful save point and explicit reload.
self.addEventListener('message', (event) => {
  if (isActivateUpdateMessage(event.data)) {
    void self.skipWaiting();
  }
});
