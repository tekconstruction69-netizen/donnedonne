'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Clock, Leaf, Package, Moon, ChevronLeft, Send, Loader2, Flag, Trash2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PostData } from '@/components/PostCard';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string };
  receiverId: string;
  createdAt: string;
  isRead: boolean;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [post, setPost] = useState<PostData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDone, setReportDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOwner = session?.user?.id === post?.user?.id;

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!session) return;
    const load = () =>
      fetch(`/api/messages?postId=${id}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setMessages(data));
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [id, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !post || !session) return;
    setSending(true);
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: id,
        receiverId: isOwner ? messages.find((m) => m.senderId !== session.user.id)?.senderId : post.user.id,
        content: newMessage.trim(),
      }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    }
    setSending(false);
  };

  const submitReport = async () => {
    if (!reportReason || !post) return;
    await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: id, reportedId: post.user.id, reason: reportReason }),
    });
    setReportDone(true);
    setShowReport(false);
  };

  const deletePost = async () => {
    if (!confirm('Supprimer cette annonce ?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">Don introuvable ou supprimé.</p>
        <Link href="/dashboard" className="btn-green">Retour aux dons</Link>
      </div>
    );
  }

  const isFood = post.type === 'FOOD';
  const canContact = session && !isOwner;
  const otherUserId = isOwner
    ? messages.find((m) => m.senderId !== session?.user?.id)?.senderId
    : post.user.id;

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/dashboard" className="btn-ghost inline-flex mb-5 -ml-2">
          <ChevronLeft size={18} /> Retour aux dons
        </Link>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Post info */}
          <div className="lg:col-span-2">
            <div className="card shadow-sm sticky top-24">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={isFood ? 'badge-food' : 'badge-object'}>
                  {isFood ? <Leaf size={12} /> : <Package size={12} />}
                  {isFood ? 'Nourriture' : 'Objet'}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 font-medium">
                  {post.category}
                </span>
                {post.isHalal && (
                  <span className="badge-halal">
                    <Moon size={12} /> Hallal
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.description}</p>

              {isFood && post.preparedDate && (
                <div className="bg-emerald-50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-emerald-700 font-medium">
                    📅 Préparé le {new Date(post.preparedDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="flex-shrink-0 mt-0.5 text-gray-400" />
                  <span>{post.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-gray-400" />
                  <span>
                    Publié {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Donneur anonyme
                </div>
                <div className="flex gap-2">
                  {isOwner && (
                    <button
                      onClick={deletePost}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer l'annonce"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {!isOwner && session && !reportDone && (
                    <button
                      onClick={() => setShowReport(true)}
                      className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      title="Signaler"
                    >
                      <Flag size={16} />
                    </button>
                  )}
                  {reportDone && (
                    <span className="text-xs text-red-400 font-medium">Signalé ✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-3">
            <div className="card shadow-sm flex flex-col" style={{ minHeight: '500px' }}>
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">?</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {isOwner ? 'Messagerie anonymisée' : 'Contacter le donneur'}
                  </p>
                  <p className="text-xs text-gray-400">Les identités restent anonymes</p>
                </div>
              </div>

              {!session ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
                  <div className="text-4xl">🔒</div>
                  <p className="text-gray-500 text-sm">Connectez-vous pour contacter le donneur</p>
                  <Link href="/auth/signin" className="btn-green text-sm py-2">
                    Se connecter
                  </Link>
                </div>
              ) : isOwner && messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
                  <div className="text-4xl">💬</div>
                  <p className="text-gray-500 text-sm">Aucun message pour ce don pour l'instant.</p>
                  <p className="text-gray-400 text-xs">Les receveurs intéressés vous contacteront ici.</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1" style={{ maxHeight: 360 }}>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === session?.user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMe
                              ? 'bg-emerald-500 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                              {isMe ? 'Vous' : isOwner ? 'Receveur' : 'Donneur'} ·{' '}
                              {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {(canContact || (isOwner && messages.length > 0 && otherUserId)) && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
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
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Signaler ce don</h2>
            <p className="text-sm text-gray-500 mb-4">Décrivez le problème rencontré avec ce don.</p>
            <select className="input-field mb-4" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option value="">Choisir une raison...</option>
              <option value="Intoxication alimentaire">Intoxication alimentaire</option>
              <option value="Produit non conforme">Produit non conforme / périmé</option>
              <option value="Objet dangereux">Objet dangereux ou non conforme</option>
              <option value="Comportement inapproprié">Comportement inapproprié du donneur</option>
              <option value="Annonce frauduleuse">Annonce frauduleuse</option>
              <option value="Autre">Autre</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReport(false); setReportReason(''); }}
                className="flex-1 border-2 border-gray-200 text-gray-600 rounded-xl py-2.5 font-semibold hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 font-semibold disabled:opacity-50 transition-all"
              >
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
