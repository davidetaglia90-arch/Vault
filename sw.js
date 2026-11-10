// Service worker: rende l'app apribile anche offline (le note sono già salvate in IndexedDB)
const C = 'vault-v1';
const CDN = [
  'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js',
  'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './icon.png', ...CDN]).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin === location.origin) {
    // rete prima (così gli aggiornamenti arrivano), cache se offline
    e.respondWith(fetch(e.request).then(r => {
      const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./'))));
  } else if (u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); return res;
    })));
  }
  // le chiamate a Google Drive non vengono intercettate
});
