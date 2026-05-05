'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Leaf, MessageCircle, Plus, Menu, X, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-emerald-600 transition-colors">
            <span className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <Leaf size={16} className="text-white" />
            </span>
            <span>donnedonne<span className="text-emerald-500">.fr</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link href="/dashboard" className="btn-ghost text-sm">
                  Parcourir les dons
                </Link>
                <Link href="/messages" className="btn-ghost text-sm relative">
                  <MessageCircle size={18} />
                  Messages
                </Link>
                <Link href="/donate" className="btn-green text-sm py-2">
                  <Plus size={18} />
                  Je donne
                </Link>
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-100">
                  <span className="text-sm text-gray-500 font-medium">{session.user?.name}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="btn-ghost text-sm text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="btn-ghost text-sm">
                  Explorer
                </Link>
                <Link href="/auth/signin" className="btn-ghost text-sm">
                  Se connecter
                </Link>
                <Link href="/auth/signup" className="btn-green text-sm py-2">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-2 animate-fade-in">
          {session ? (
            <>
              <Link href="/dashboard" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>Parcourir les dons</Link>
              <Link href="/messages" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>
                <MessageCircle size={18} /> Messages
              </Link>
              <Link href="/donate" className="btn-green justify-start" onClick={() => setMenuOpen(false)}>
                <Plus size={18} /> Je donne
              </Link>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <User size={16} /> {session.user?.name}
                </span>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-red-500 font-medium hover:underline">
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>Explorer</Link>
              <Link href="/auth/signin" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>Se connecter</Link>
              <Link href="/auth/signup" className="btn-green justify-start" onClick={() => setMenuOpen(false)}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
