'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { PostData } from './PostCard';
import Link from 'next/link';

interface Props {
  posts: PostData[];
  userLocation: { lat: number; lng: number } | null;
}

function RecenterButton({ userLocation }: { userLocation: { lat: number; lng: number } | null }) {
  const map = useMap();
  if (!userLocation) return null;
  return (
    <button
      className="absolute top-3 right-3 z-[1000] bg-white shadow-md rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all"
      onClick={() => map.setView([userLocation.lat, userLocation.lng], 13)}
    >
      📍 Ma position
    </button>
  );
}

export default function MapView({ posts, userLocation }: Props) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [48.8566, 2.3522]; // Paris fallback

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={center as [number, number]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={10}
            fillColor="#3b82f6"
            color="#fff"
            weight={3}
            fillOpacity={0.9}
          >
            <Popup>
              <span className="font-semibold text-sm">Votre position</span>
            </Popup>
          </CircleMarker>
        )}

        {/* Post markers */}
        {posts.map((post) => (
          <CircleMarker
            key={post.id}
            center={[post.latitude, post.longitude]}
            radius={9}
            fillColor={post.type === 'FOOD' ? '#10b981' : '#3b82f6'}
            color="#fff"
            weight={2.5}
            fillOpacity={0.85}
          >
            <Popup>
              <div className="min-w-[160px]">
                <span className={`text-xs font-semibold ${post.type === 'FOOD' ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {post.type === 'FOOD' ? '🥗 Nourriture' : '📦 Objet'}
                  {post.isHalal && ' · 🌙 Hallal'}
                </span>
                <p className="font-bold text-gray-900 mt-1 text-sm">{post.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{post.description}</p>
                <Link
                  href={`/post/${post.id}`}
                  className="mt-2 block text-center text-xs bg-emerald-500 text-white rounded-lg px-3 py-1.5 font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Voir le don
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <RecenterButton userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}
