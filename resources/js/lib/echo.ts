import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window { Pusher: any; Echo: any; }
}

let echoInstance: any = null;

if (typeof window !== 'undefined') {
  // Podstaw wymagany konstruktor Pusher (Reverb używa protokołu pusher-like)
  window.Pusher = Pusher;

  const key = import.meta.env.VITE_REVERB_APP_KEY || 'local';
  const host = import.meta.env.VITE_REVERB_HOST || '127.0.0.1';
  const port = Number(import.meta.env.VITE_REVERB_PORT) || 8080;
  const scheme = (import.meta.env.VITE_REVERB_SCHEME || 'http').toString();

  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

  console.debug('[Echo/Reverb] init', { key, host, port, scheme });

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws'],
    authEndpoint: '/broadcasting/auth',
    auth: { headers: { 'X-CSRF-TOKEN': csrf } },
  });

  window.Echo = echoInstance;

  // Diagnostyka po krótkim czasie
  setTimeout(() => {
    try {
  const conn = (echoInstance as any).connector?.pusher?.connection;
  console.debug('[Echo/Reverb] state', conn?.state, 'channels', Object.keys((echoInstance as any).connector?.pusher?.channels?.channels || {}));
    } catch (e) {
      console.warn('[Echo/Reverb] diagnostyka nieudana', e);
    }
  }, 600);
}

export default echoInstance;
