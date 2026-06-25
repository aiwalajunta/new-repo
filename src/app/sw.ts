import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global { interface WorkerGlobalScope extends SerwistGlobalConfig { __SW_MANIFEST: (PrecacheEntry | string)[] | undefined; } }
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true, clientsClaim: true, navigationPreload: true,
  runtimeCaching: [
    { matcher: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i, handler: "CacheFirst", options: { cacheName: "google-fonts", expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 }, cacheableResponse: { statuses: [0, 200] } } },
    { matcher: /^https:\/\/res\.cloudinary\.com\/.*/i, handler: "StaleWhileRevalidate", options: { cacheName: "cloudinary-images", expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }, cacheableResponse: { statuses: [0, 200] } } },
    { matcher: /^\/api\/(products|categories)/, handler: "NetworkFirst", options: { cacheName: "api-data", expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, networkTimeoutSeconds: 5, cacheableResponse: { statuses: [0, 200] } } },
    ...defaultCache,
  ],
});
serwist.addEventListeners();

self.addEventListener("sync", (event) => {
  if ((event as SyncEvent).tag === "sync-wishlist") void (event as SyncEvent).waitUntil(syncPendingWishlist());
});

async function syncPendingWishlist() {
  const { get, del } = await import("idb-keyval");
  const pending = (await get("pending-wishlist")) as Array<{ productId: string; action: "add" | "remove" }> | undefined;
  if (!pending?.length) return;
  for (const item of pending) {
    try { await fetch("/api/wishlist", { method: item.action === "add" ? "POST" : "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: item.productId }) }); } catch { /* retry on next sync */ }
  }
  await del("pending-wishlist");
}
