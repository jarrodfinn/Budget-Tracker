const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/assets/js/db.js",
  "/assets/js/index.js",
  "/assets/css/styles.css",
  "/assets/images/icons/icon-72x72.png",
  "/assets/images/icons/icon-96x96.png",
  "/assets/images/icons/icon-128x128.png",
  "/assets/images/icons/icon-144x144.png",
  "/assets/images/icons/icon-152x152.png",
  "/assets/images/icons/icon-192x192.png",
  "/assets/images/icons/icon-384x384.png",
  "/assets/images/icons/icon-512x512.png",
  "/manifest.webmanifest",
  "/service-worker.js",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch(function (error) {
        console.error(error);
      })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", function (event) {
  if (event.request.clone().method === "GET") {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (response) {
            console.log("Found ", event.request.url, " in cache.");
            return response;
          }
          console.log("Network request for ", event.request.url);
          return fetch(event.request).then((response) => {
            // cache the website file whenever we visit the page
            return caches.open(cacheName).then((cache) => {
              cache.put(event.request.url, response.clone());
              return response;
            });
          });
        })
        .catch((error) => {})
    );
  }
  if (event.request.clone().method === "POST") {
    fetch(event.request.clone()).catch(function (error) {});
  }
});
