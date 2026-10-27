// Träningslogg v1.1.0
const VERSION = 'traningslogg-v1.1.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);

  if(request.mode === 'navigate'){
    event.respondWith(
      fetch(request).then(response => {
        const copy = response.clone();
        caches.open(VERSION).then(cache => cache.put('./index.html', copy));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  if(url.origin === self.location.origin || CDN_HOSTS.includes(url.hostname)){
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if(response && (response.ok || response.type === 'opaque')){
          const copy = response.clone();
          caches.open(VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      }))
    );
  }
});
