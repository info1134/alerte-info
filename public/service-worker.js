// Simple service worker pour les notifications push

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Nouvelle alerte', 
      {
        body: data.body || 'Une nouvelle alerte a été publiée.',
        icon: '/favicon.ico'
      }
    )
  );
});

// Permet l'affichage basique même hors-ligne (optionnel)
self.addEventListener('fetch', event => {
  // On peut personnaliser ici pour faire du offline
  // event.respondWith(fetch(event.request));
});
