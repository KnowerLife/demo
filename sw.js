self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("knower-life-v1").then((cache) => {
      return cache.addAll(["/", "/styles.css", "/script.js"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});