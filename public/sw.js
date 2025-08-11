// 提升版本號以強制用戶升級至最新快取
const CACHE_NAME = 'smart-wardrobe-v2.0.0';
// 僅緩存基礎殼層與必要資源，避免緩存特定 hashed 檔名導致新版不更新
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 緩存文件');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: 緩存失敗', error);
      })
  );
  // 立即接管新 SW，縮短用戶看到新版的時間
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 清理舊緩存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 立即控制所有 clients，避免必須刷新兩次
  self.clients.claim();
});

// 攔截網絡請求
self.addEventListener('fetch', (event) => {
  // 只處理 GET 請求
  if (event.request.method !== 'GET') {
    return;
  }

  // API 請求策略：網絡優先，緩存備用
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 如果是成功的響應，更新緩存
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 網絡失敗時，嘗試從緩存獲取
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 如果沒有緩存，返回離線頁面
            return new Response(
              JSON.stringify({
                message: '網絡連接失敗，請檢查網絡設置',
                offline: true
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // 靜態資源策略：緩存優先
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果緩存中有，直接返回
        if (response) {
          return response;
        }

        // 否則從網絡獲取
        return fetch(event.request).then((response) => {
          // 檢查是否是有效響應
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆響應並緩存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // 如果是導航請求，返回離線頁面
        if (event.request.mode === 'navigate') {
          return caches.match('/').then((cachedResponse) => {
            return cachedResponse || new Response(
              `<!DOCTYPE html>
              <html>
              <head>
                <title>智能衣櫃 - 離線模式</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: #f8f9fa;
                  }
                  .offline-message {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    max-width: 400px;
                    margin: 0 auto;
                  }
                  .icon { font-size: 64px; margin-bottom: 20px; }
                  h1 { color: #333; margin-bottom: 15px; }
                  p { color: #666; line-height: 1.6; }
                  button {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="offline-message">
                  <div class="icon">🔌</div>
                  <h1>離線模式</h1>
                  <p>網絡連接不可用，但你仍可以瀏覽已緩存的內容。</p>
                  <p>連接網絡後，數據將自動同步。</p>
                  <button onclick="window.location.reload()">重試連接</button>
                </div>
              </body>
              </html>`,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          });
        }
      })
  );
});

// 後台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 這裡可以實現後台數據同步邏輯
      console.log('Service Worker: 後台同步觸發')
    );
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: '查看詳情',
          icon: '/logo192.png'
        },
        {
          action: 'close',
          title: '關閉',
          icon: '/logo192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知點擊處理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});