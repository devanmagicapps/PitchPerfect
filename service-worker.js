// Nama cache dan versinya. Ubah versi ini jika Anda memperbarui file.
const CACHE_NAME = 'pitch-perfect-user-panel-v2';

// Daftar file inti yang akan disimpan di cache untuk mode offline.
const URLS_TO_CACHE = [
  '/app.html',
  '/', // Alihkan ke halaman utama jika offline
  // CSS & Fonts dari Google (URL lengkap)
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@500;600&display=swap',
  // Ikon (sesuaikan path jika berbeda)
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Event 'install': Dipicu saat service worker pertama kali diinstal.
self.addEventListener('install', event => {
  console.log('Service Worker: Menginstal...');
  // Tunggu hingga proses caching selesai sebelum melanjutkan.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Membuka cache dan menyimpan file inti');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Aktifkan service worker baru segera
  );
});

// Event 'activate': Dipicu saat service worker diaktifkan.
// Berguna untuk membersihkan cache lama.
self.addEventListener('activate', event => {
  console.log('Service Worker: Mengaktifkan...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Menghapus cache lama', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Event 'fetch': Dipicu setiap kali aplikasi meminta resource (file, gambar, dll).
// Ini adalah inti dari fungsionalitas offline.
self.addEventListener('fetch', event => {
  // Kita hanya akan menangani request GET (bukan POST ke Firebase, dll.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika resource ditemukan di cache, langsung kembalikan dari cache.
        if (response) {
          console.log('Service Worker: Mengambil dari cache:', event.request.url);
          return response;
        }

        // Jika tidak ada di cache, coba ambil dari network.
        console.log('Service Worker: Mengambil dari network:', event.request.url);
        return fetch(event.request);
      })
      .catch(error => {
        // Jika network gagal (offline), ini adalah fallback.
        console.log('Service Worker: Gagal mengambil dari network, error:', error);
        // Anda bisa mengembalikan halaman offline default di sini jika mau.
      })
  );
});

Langkah Selanjutnya:
 * Letakkan File: Simpan kedua file ini (manifest.json dan service-worker.js) di direktori root proyek Anda, di level yang sama dengan admin-panel.html.
 * Buat Folder Ikon: Buat sebuah folder bernama icons di direktori root, dan letakkan file ikon Anda (icon-192x192.png dan icon-512x512.png) di dalamnya.
 * Verifikasi HTML: Pastikan di dalam <head> file admin-panel.html Anda sudah ada referensi ke manifest:
   <link rel="manifest" href="manifest.json">

 * Verifikasi Pendaftaran Service Worker: Pastikan di dalam <script> file admin-panel.html Anda ada kode untuk mendaftarkan service worker (yang sudah ada di versi sebelumnya):
   if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('SW terdaftar!', reg))
            .catch(err => console.log('Pendaftaran SW gagal:', err));
    });
}
