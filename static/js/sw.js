const CACHE_NAME = 'pasajeros-pwa-v2';  // Incrementa la versión para forzar actualización
const urlsToCache = [
    './',
    './static/css/style.css',
    './static/js/app.js',
    './static/manifest.json',
    './static/icons/icon.png'           // ícono principal
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});