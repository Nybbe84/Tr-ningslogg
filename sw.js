// Träningslogg service worker. Version 1.2.0
const VERSION = 'traningslogg-v1.2.0';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/apple-touch-icon.png', './icons/icon-192.png',
  './icons/icon-512.png', './icons/icon-maskable-512.png'
];
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(req.mode === 'navigate'){
    event.respondWith(fetch(req).then(res => {
      const copy=res.clone(); caches.open(VERSION).then(c => c.put('./index.html',copy)); return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  if(url.origin === self.location.origin || CDN_HOSTS.includes(url.hostname)){
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if(res && (res.ok || res.type === 'opaque')){ const copy=res.clone(); caches.open(VERSION).then(c => c.put(req,copy)); }
      return res;
    })));
  }
});
