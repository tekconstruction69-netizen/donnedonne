'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Map, List, SlidersHorizontal, Search, Loader2, Leaf, Package } from 'lucide-react';
import PostCard, { PostData } from '@/components/PostCard';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
      <Loader2 size={24} className="text-gray-400 animate-spin" />
    </div>
  ),
});

const FOOD_CATS = ['Repas cuisiné', 'Fruits & Légumes', 'Produits secs', 'Produits laitiers', 'Boulangerie', 'Autre'];
const OBJ_CATS = ['Vêtements', 'Chaussures', 'Literie', 'Meubles', 'Livres', 'Jouets', 'Électronique', 'Autre'];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState({ type: 'ALL', halal: false, search: '' });
  const [reportModal, setReportModal] = useState<{ postId: string; reportedId: string } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.type !== 'ALL') params.set('type', filters.type);
    if (filters.halal) params.set('halal', 'true');

    const res = await fetch(`/api/posts?${params}`);
    if (res.ok) {
      let data: PostData[] = await res.json();
      if (userLocation) {
        data = data
          .map((p) => ({
            ...p,
            distance: haversine(userLocation.lat, userLocation.lng, p.latitude, p.longitude),
          }))
          .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
      }
      setPosts(data);
    }
    setLoading(false);
  }, [filters.type, filters.halal, userLocation]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((p) =>
    filters.search
      ? p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      : true
  );

  const handleReport = (postId: string, reportedId: string) => {
    if (!session) return;
    setReportModal({ postId, reportedId });
  };

  const submitReport = async () => {
    if (!reportModal || !reportReason.trim()) return;
    setReportLoading(true);
    await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reportModal, reason: reportReason }),
    });
    setReportLoading(false);
    setReportModal(null);
    setReportReason('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-10 py-2.5 text-sm"
                placeholder="Rechercher un don..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Type filters */}
            <div className="flex items-center gap-2">
              {[
                { value: 'ALL', label: 'Tous', icon: null },
                { value: 'FOOD', label: 'Nourriture', icon: <Leaf size={14} /> },
                { value: 'OBJECT', label: 'Objets', icon: <Package size={14} /> },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilters({ ...filters, type: f.value })}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.type === f.value
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}

              <button
                onClick={() => setFilters({ ...filters, halal: !filters.halal })}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.halal
                    ? 'bg-amber-400 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🌙 Hallal
              </button>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 ml-auto">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={16} /> Liste
              </button>
              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Map size={16} /> Carte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'map' ? (
          <div className="h-[calc(100vh-220px)] min-h-[500px]">
            <MapView posts={filteredPosts} userLocation={userLocation} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 font-medium">
                {loading ? 'Chargement...' : `${filteredPosts.length} don${filteredPosts.length !== 1 ? 's' : ''} disponible${filteredPosts.length !== 1 ? 's' : ''}`}
                {userLocation && !loading && ' · trié par distance'}
              </p>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🌱</div>
                <h3 className="font-bold text-gray-700 text-lg mb-2">Aucun don disponible</h3>
                <p className="text-gray-400 text-sm mb-6">Soyez le premier à publier un don dans votre quartier !</p>
                <Link href="/donate" className="btn-green">
                  Publier un don
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReport={session ? handleReport : undefined}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Signaler ce don</h2>
            <p className="text-sm text-gray-500 mb-4">Décrivez le problème rencontré.</p>
            <select
              className="input-field mb-4"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">Choisir une raison...</option>
              <option value="Intoxication alimentaire">Intoxication alimentaire</option>
              <option value="Produit non conforme">Produit non conforme / périmé</option>
              <option value="Objet dangereux">Objet dangereux</option>
              <option value="Comportement inapproprié">Comportement inapproprié</option>
              <option value="Annonce frauduleuse">Annonce frauduleuse</option>
              <option value="Autre">Autre</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => { setReportModal(null); setReportReason(''); }}
                className="flex-1 border-2 border-gray-200 text-gray-600 rounded-xl py-2.5 font-semibold hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason || reportLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 font-semibold disabled:opacity-50 transition-all"
              >
                {reportLoading ? 'Envoi...' : 'Signaler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
