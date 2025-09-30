const CACHE_NAME = 'pitch-perfect-v2';
// Daftar file yang akan di-cache saat instalasi.
// Sesuaikan dengan nama file dan path yang benar di proyek Anda.
const urlsToCache = [
  '/',
  '/app.html',
  '/index.html',
  '/loading.html',
  '/admin.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@500;600&display=swap'
];

// Event: Install
// Saat service worker diinstal, cache file-file utama.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event: Activate
// Hapus cache lama jika ada versi baru.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Hapus cache jika namanya tidak sama dengan cache saat ini.
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Event: Fetch
// Tangani semua permintaan jaringan.
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. Coba ambil dari jaringan terlebih dahulu (Network First)
    fetch(event.request)
      .then(response => {
        // Jika berhasil, perbarui cache dengan versi terbaru
        // dan kembalikan respons dari jaringan.
        
        // Buat klon dari respons. Respons hanya bisa dibaca sekali.
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
          
        return response;
      })
      .catch(error => {
        // 2. Jika jaringan gagal (offline), coba ambil dari cache
        console.log('Gagal mengambil dari jaringan, mencoba dari cache...', error);
        return caches.match(event.request)
          .then(response => {
            if (response) {
              // Jika ada di cache, kembalikan versi dari cache.
              return response;
            }
            // Jika tidak ada di jaringan maupun di cache, akan menghasilkan error standar browser.
          });
      })
  );
});
