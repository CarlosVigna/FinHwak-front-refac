// Service worker minimo, so pra satisfazer o criterio de instalabilidade
// do Chrome (exige um listener de 'fetch' registrado). Sem cache proprio
// -- so repassa pro network -- pra nao arriscar telas presas em JS/CSS
// desatualizado depois de um deploy.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
