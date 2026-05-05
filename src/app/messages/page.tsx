'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, Loader2, MessageCircle, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Msg {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sender: { id: string; name: string };
  receiver: { id: string; name: string };
  post: { id: string; title: string; userId: string };
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  postId: string;
  postTitle: string;
  otherId: string;
  isOwner: boolean;
  lastMessage: Msg;
  messages: Msg[];
  unread: number;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const loadMessages = async () => {
    if (!session) return;
    const res = await fetch('/api/messages');
    if (!res.ok) return;
    const data: Msg[] = await res.json();

    // Group by postId
    const map = new Map<string, Conversation>();
    data.forEach((msg) => {
      const key = msg.post.id;
      if (!map.has(key)) {
        const isOwner = msg.post.userId === session.user.id;
        const otherId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId;
        map.set(key, {
          postId: key,
          postTitle: msg.post.title,
          otherId,
          isOwner,
          lastMessage: msg,
          messages: [],
          unread: 0,
        });
      }
      const conv = map.get(key)!;
      conv.messages.push(msg);
      conv.lastMessage = msg;
      if (!msg.isRead && msg.receiverId === session.user.id) conv.unread++;
    });

    setConversations(Array.from(map.values()).sort((a, b) =>
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    ));
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected, conversations]);

  const selectedConv = conversations.find((c) => c.postId === selected);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !session) return;
    setSending(true);
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: selectedConv.postId,
        receiverId: selectedConv.otherId,
        content: newMessage.trim(),
      }),
    });
    setNewMessage('');
    setSending(false);
    await loadMessages();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <MessageCircle size={26} className="text-emerald-500" />
          Mes messages
        </h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex" style={{ minHeight: '600px' }}>
          {/* Sidebar */}
          <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-500">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>

            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="text-4xl">💬</div>
                <p className="text-gray-500 text-sm">Aucune conversation</p>
                <Link href="/dashboard" className="btn-green text-sm py-2">
                  Explorer les dons
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.postId}
                    onClick={() => setSelected(conv.postId)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-slate-50 transition-colors ${
                      selected === conv.postId ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 truncate mb-0.5">
                          {conv.isOwner ? '📦 Mon don' : '🎁 Don reçu'} · {conv.postTitle}
                        </p>
                        <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                          {conv.lastMessage.senderId === session?.user?.id ? 'Vous : ' : ''}
                          {conv.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!selected ? 'hidden md:flex' : 'flex'}`}>
            {!selectedConv ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
                <div className="text-5xl opacity-20">💬</div>
                <p className="text-gray-400 text-sm">Sélectionnez une conversation</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="md:hidden btn-ghost p-1.5 -ml-1"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{selectedConv.postTitle}</p>
                    <p className="text-xs text-gray-400">
                      {selectedConv.isOwner ? 'Un receveur vous contacte' : 'Vous contactez le donneur'}
                      {' · '}
                      <Link href={`/post/${selectedConv.postId}`} className="text-emerald-500 hover:underline">
                        Voir le don
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedConv.messages.map((msg) => {
                    const isMe = msg.senderId === session?.user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMe ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                            {isMe ? 'Vous' : selectedConv.isOwner ? 'Receveur' : 'Donneur'} ·{' '}
                            {format(new Date(msg.createdAt), 'dd/MM HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1 py-2.5 text-sm"
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="btn-green py-2.5 px-4"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
