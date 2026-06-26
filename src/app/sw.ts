import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global { interface WorkerGlobalScope extends SerwistGlobalConfig { __SW_MANIFEST: (PrecacheEntry | string)[] | undefined; } }
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true, clientsClaim: true, navigationPreload: true,
  runtimeCaching: [
    { matcher: /^\/api\/(products|categories|appointments)/, handler: "NetworkFirst", options: { cacheName: "api-data", expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, networkTimeoutSeconds: 5, cacheableResponse: { statuses: [0, 200] } } },
    ...defaultCache,
  ],
});
serwist.addEventListeners();
