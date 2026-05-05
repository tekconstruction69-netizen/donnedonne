'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import DisclaimerModal from '@/components/DisclaimerModal';

export default function SignupPage() {
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setError('');
    setShowDisclaimer(true);
  };

  const handleAcceptDisclaimer = async () => {
    setShowDisclaimer(false);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, disclaimerAccepted: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription.");
        return;
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) router.push('/dashboard');
      else setError('Inscription réussie, veuillez vous connecter.');
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showDisclaimer && (
        <DisclaimerModal
          onAccept={handleAcceptDisclaimer}
          onDecline={() => setShowDisclaimer(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-gray-900">
              <span className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow">
                <Leaf size={20} className="text-white" />
              </span>
              donnedonne<span className="text-emerald-500">.fr</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">Rejoignez la communauté solidaire</p>
          </div>

          <div className="card shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer un compte</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Prénom & Nom</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Marie Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Adresse email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="marie@exemple.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Minimum 6 caractères"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-green w-full mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Inscription en cours...
                  </span>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Déjà inscrit ?{' '}
              <Link href="/auth/signin" className="text-emerald-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 px-4">
            En vous inscrivant, vous acceptez notre clause de non-responsabilité concernant les échanges entre particuliers.
          </p>
        </div>
      </div>
    </>
  );
}
