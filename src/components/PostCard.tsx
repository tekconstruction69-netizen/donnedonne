'use client';

import Link from 'next/link';
import { MapPin, Clock, Leaf, Package, Moon, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface PostData {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  isHalal: boolean;
  preparedDate: string | null;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  user: { id: string; name: string };
  distance?: number;
}

interface Props {
  post: PostData;
  onReport?: (postId: string, reportedId: string) => void;
  showContact?: boolean;
}

const FOOD_CATEGORIES = ['Repas cuisiné', 'Fruits & Légumes', 'Produits secs', 'Produits laitiers', 'Boulangerie', 'Autre'];
const OBJECT_CATEGORIES = ['Vêtements', 'Chaussures', 'Literie', 'Meubles', 'Livres', 'Jouets', 'Électronique', 'Autre'];

export default function PostCard({ post, onReport, showContact = true }: Props) {
  const isFood = post.type === 'FOOD';

  return (
    <div className="card hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={isFood ? 'badge-food' : 'badge-object'}>
            {isFood ? <Leaf size={12} /> : <Package size={12} />}
            {isFood ? 'Nourriture' : 'Objet'}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 font-medium">
            {post.category}
          </span>
          {post.isHalal && (
            <span className="badge-halal">
              <Moon size={12} />
              Hallal
            </span>
          )}
        </div>
        {onReport && (
          <button
            onClick={() => onReport(post.id, post.user.id)}
            className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            title="Signaler"
          >
            <Flag size={15} />
          </button>
        )}
      </div>

      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{post.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.description}</p>

      {isFood && post.preparedDate && (
        <p className="text-xs text-emerald-600 font-medium mb-2">
          Préparé le {new Date(post.preparedDate).toLocaleDateString('fr-FR')}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1 truncate">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{post.address}</span>
        </span>
        {post.distance !== undefined && (
          <span className="flex-shrink-0 font-semibold text-emerald-600">
            {post.distance < 1
              ? `${Math.round(post.distance * 1000)} m`
              : `${post.distance.toFixed(1)} km`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
        </span>
        {showContact && (
          <Link
            href={`/post/${post.id}`}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
          >
            Voir & Contacter →
          </Link>
        )}
      </div>
    </div>
  );
}
