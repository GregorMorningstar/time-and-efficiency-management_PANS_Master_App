import React, { useEffect, useState, useCallback, useRef } from 'react';
import echo from '../../lib/echo';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';


interface User {
  id: number;
  name: string;
  email: string;
}

interface OnlineUserMeta { id: number; name: string }

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
}

interface ChatPageProps  {
  user_id: number;
  other_user_id: number | null;
  users: User[];
  chats: ChatMessage[];
}

const ChatPage: React.FC<ChatPageProps> = ({ user_id, other_user_id, users, chats }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(chats || []);
  const [input, setInput] = useState('');
  const [echoStatus, setEchoStatus] = useState<string>('init');
  const castConnector = () => (echo as any).connector?.pusher; 
  // ref do auto-scroll na dół listy wiadomości
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');
  const [onlineIds, setOnlineIds] = useState<number[]>([]);

  useEffect(() => {
  const conn = castConnector()?.connection;
  setEchoStatus(conn?.state || 'connecting');
    if (conn) {
      const handler = (states: any) => setEchoStatus(states.current || conn.state);
      conn.bind('state_change', handler);
      return () => conn.unbind('state_change', handler);
    }
  }, []);

  useEffect(() => {
  let cancelled = false;
  let channel: any = null; // prywatny kanał użytkownika
  let presenceChannel: any = null; // presence.chat
  let channelName: string | null = null;
  const boot = async () => {
      let attempts = 0;
      while (!(window as any).Echo && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      if (cancelled) return;
      if (!(window as any).Echo) {
        console.error('[Echo] nadal brak instancji po oczekiwaniu');
        return;
      }
  channelName = `private-chat.${user_id}`;
      setEchoStatus(castConnector()?.connection?.state || 'connecting');
      console.debug('[Echo] Próba subskrypcji kanału', `chat.${user_id}`);
      try { console.debug('[Echo] Lista kanałów przed', Object.keys(castConnector()?.channels?.channels || {})); } catch {}
  channel = echo.private(`chat.${user_id}`)
        .listen('.MessageSent', (e: any) => {
          console.debug('Odebrano event MessageSent', e);
          setMessages(prev => {
              // unik duplikatu: jeśli już istnieje (po optimistycznym dodaniu) nie dodajemy
              if (prev.some(m => m.id === e.chatMessage.id)) return prev;
              return [...prev, e.chatMessage];
          });
        });
      try { setTimeout(()=>{ try { console.debug('[Echo] Lista kanałów po', Object.keys(castConnector()?.channels?.channels || {})); } catch {} },500);} catch {}
      // monitoruj stan
      // Presence channel subskrypcja dla online status
      try {
        presenceChannel = (echo as any).join('presence.chat')
          .here((users: OnlineUserMeta[]) => {
            setOnlineIds(users.map(u => u.id));
          })
          .joining((user: OnlineUserMeta) => {
            setOnlineIds(prev => prev.includes(user.id) ? prev : [...prev, user.id]);
          })
          .leaving((user: OnlineUserMeta) => {
            setOnlineIds(prev => prev.filter(id => id !== user.id));
          });
      } catch (e) { console.warn('Presence join error', e); }

      try {
        const conn = castConnector()?.connection;
        if (conn) {
          const handler = (states: any) => setEchoStatus(states.current || conn.state);
          conn.bind('state_change', handler);
          return () => {
            if (channel) channel.stopListening('MessageSent');
            if (channelName) echo.leaveChannel(channelName as string);
            if (presenceChannel) (echo as any).leave('presence.chat');
            conn.unbind('state_change', handler);
          };
        }
      } catch {}
      return () => {
        if (channel) channel.stopListening('MessageSent');
        if (channelName) echo.leaveChannel(channelName as string);
        if (presenceChannel) (echo as any).leave('presence.chat');
      };
    };
    boot();
  return () => { cancelled = true; if (channel) channel.stopListening('MessageSent'); if (channelName) echo.leaveChannel(channelName as string); if (presenceChannel) (echo as any).leave('presence.chat'); };
  }, [user_id]);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !other_user_id) return;
    try {
      const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
      if (!csrf) console.warn('Brak meta csrf-token w DOM');
      const res = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf || ''
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          other_user_id: other_user_id,
          message: input.trim(),
        })
      });
      if (res.ok) {
        const created: ChatMessage = await res.json();
        setMessages(prev => prev.some(m => m.id === created.id) ? prev : [...prev, created]);
        setInput('');
      } else {
        console.error('Błąd wysyłania', await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  }, [input, other_user_id]);

  const activeUser = other_user_id ? users.find(u => u.id === other_user_id) : null;

  useEffect(() => {
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 20);
    return () => clearTimeout(t);
  }, [messages, other_user_id]);

  const breadcrumbs = [
    { title: 'Strona główna', href: '/' },
    { title: 'Chat', href: '/chat' }
  ];

  return (

     <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Chat" />
    <div className="container mx-auto shadow-lg rounded-lg">
      {/* header */}
      <div className="px-5 py-5 flex flex-wrap gap-4 items-center bg-white border-b-2">
    
        {activeUser ? (
          <div className="text-sm text-blue-600">
            Aktualnie rozmawiasz z <span className="font-semibold">{activeUser.name}</span>
            <span className="text-gray-400 ml-2">(wydział: #Marketing)</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Wybierz użytkownika aby rozpocząć rozmowę</div>
        )}
      </div>
      {/* end header */}
      {/* Chatting */}
      <div className="flex flex-row justify-between bg-white">
        {/* chat list */}
        <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
          {/* search component */}
          <div className="border-b-2 py-4 px-2">
            <input
              type="text"
              placeholder="Szukaj użytkownika..."
              className="py-2 px-3 border-2 border-gray-200 rounded-2xl w-full focus:outline-none focus:border-blue-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* end search component */}
          {/* user list z bazy */}
          {(() => {
            const q = search.trim().toLowerCase();
            const filtered = users.filter(u => (
              u.id !== user_id && (
                !q ||
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
              )
            ));
            if (filtered.length === 0) return <div className="p-4 text-sm text-gray-500">Brak wyników</div>;
            return filtered.map(user => {
              const isActive = user.id === other_user_id;
              const online = onlineIds.includes(user.id);
              return (
                <button
                  type="button"
                  key={user.id}
                  className={`flex flex-row gap-3 text-left w-full py-3 px-3 items-center border-b hover:bg-gray-50 focus:outline-none ${isActive ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}
                  onClick={() => { window.location.href = `/chat?other_user_id=${user.id}`; }}
                >
                  <img
                    src={`https://i.pravatar.cc/150?u=${user.id}`}
                    className="object-cover h-12 w-12 rounded-full"
                    alt={user.name}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                  <span className={`ml-auto w-3 h-3 rounded-full ${online ? 'bg-green-500' : 'bg-red-400'} shadow-inner`} title={online ? 'Online' : 'Offline'}></span>
                </button>
              );
            });
          })()}
          {/* end user list */}
        </div>
        {/* end chat list */}
        {/* message */}
        <div className="w-full px-5 flex flex-col justify-between">
          <div className="flex flex-col mt-5 space-y-3 overflow-y-auto max-h-[70vh] pr-2">
            {messages.map(msg => {
              const isOwn = msg.sender_id === user_id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && (
                    <img
                      src={`https://i.pravatar.cc/100?u=${msg.sender_id}`}
                      className="object-cover h-8 w-8 rounded-full mr-2"
                      alt="avatar"
                    />
                  )}
                  <div className={`px-4 py-2 rounded-2xl text-sm shadow max-w-[60%] break-words ${isOwn ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                    {msg.message}
                    <div className="mt-1 text-[10px] opacity-70 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </div>
                  </div>
                  {isOwn && (
                    <img
                      src={`https://i.pravatar.cc/100?u=${msg.sender_id}`}
                      className="object-cover h-8 w-8 rounded-full ml-2"
                      alt="avatar"
                    />
                  )}
                </div>
              );
            })}
            {/* znacznik końca listy do auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="py-4">
            <div className="flex gap-2">
              <input
                className="w-full bg-gray-100 border border-gray-300 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                type="text"
                placeholder={other_user_id ? 'Napisz wiadomość...' : 'Wybierz użytkownika z listy po lewej'}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={!other_user_id}
              />
              <button
                type="submit"
                disabled={!input.trim() || !other_user_id}
                className="px-5 rounded-xl bg-blue-500 text-white font-medium disabled:opacity-40"
              >Wyślij</button>
            </div>
          </form>
        </div>
       
      </div>
    </div>


   </AppLayout>
  );
};

export default ChatPage;