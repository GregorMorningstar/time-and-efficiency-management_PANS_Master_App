import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const KEY = import.meta.env.VITE_PUSHER_APP_KEY || 'local';
const HOST = import.meta.env.VITE_PUSHER_HOST || '127.0.0.1';
const PORT = Number(import.meta.env.VITE_PUSHER_PORT || 8080);
const IS_HTTPS = window.location.protocol === 'https:';

(window as any).Pusher = Pusher;

(window as any).Echo = new Echo({
  broadcaster: 'pusher',
  key: KEY,
  wsHost: HOST,
  wsPort: PORT,
  wssPort: PORT,
  forceTLS: IS_HTTPS,
  enabledTransports: IS_HTTPS ? ['wss'] : ['ws'],
  disableStats: true,
  authEndpoint: '/broadcasting/auth',
  auth: {
    headers: {
      'X-CSRF-TOKEN':
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    },
  },
});
