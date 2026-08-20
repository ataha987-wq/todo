const CACHE_NAME = 'shumoo-tasks-cache-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // لا تخزن مؤقتًا أي طلب لجوجل أبس سكريبت - عشان البيانات تفضل محدثة دايمًا
  if (url.includes('script.google.com')) {
    // استراتيجية Network Only للطلبات المتجهة للسيرفر
    event.respondWith(
      fetch(event.request).catch(() => {
        // في حالة عدم الاتصال، نرجع رد فارغ عشان مفيش كاش للبيانات
        return new Response(JSON.stringify({ tasks: [] }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // للملفات المحلية: Network First ثم Cache كاحتياطي
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // خزّن النسخة الجديدة في الكاش
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // لو مفيش اتصال، استخدم النسخة المخزنة
        return caches.match(event.request);
      })
  );
});