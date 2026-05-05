'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Leaf, Package, MapPin, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Moon } from 'lucide-react';

const FOOD_CATS = ['Repas cuisiné', 'Fruits & Légumes', 'Produits secs', 'Produits laitiers', 'Boulangerie', 'Autre'];
const OBJ_CATS = ['Vêtements', 'Chaussures', 'Literie', 'Meubles', 'Livres', 'Jouets', 'Électronique', 'Autre'];

export default function DonatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    category: '',
    isHalal: false,
    preparedDate: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((f) => ({ ...f, latitude: String(latitude), longitude: String(longitude) }));
        // Reverse geocoding via Nominatim (free)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setForm((f) => ({ ...f, address: addr }));
        } catch {
          setForm((f) => ({ ...f, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        }
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  };

  const canNext = () => {
    if (step === 1) return !!form.type;
    if (step === 2) return !!form.title && !!form.description && !!form.category;
    if (step === 3) return !!form.address && !!form.latitude && !!form.longitude;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la publication.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Don publié !</h1>
          <p className="text-gray-500 mb-6">
            Votre annonce est maintenant visible par les receveurs autour de vous. Merci pour votre générosité !
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setSuccess(false); setStep(1); setForm({ type:'',title:'',description:'',category:'',isHalal:false,preparedDate:'',address:'',latitude:'',longitude:'' }); }}
              className="flex-1 btn-outline">
              Nouveau don
            </button>
            <Link href="/dashboard" className="flex-1 btn-green text-center">
              Voir les dons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="btn-ghost text-sm inline-flex mb-4 -ml-2">
            <ChevronLeft size={18} /> Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Publier un don</h1>
          <p className="text-gray-500 text-sm mt-1">Partagez ce dont vous n'avez plus besoin</p>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-5">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > s
                      ? 'bg-emerald-500 text-white'
                      : step === s
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={`h-1 flex-1 rounded-full transition-all ${step > s ? 'bg-emerald-500' : 'bg-gray-100'}`} style={{ width: 60 }} />
                )}
              </div>
            ))}
            <div className="ml-2 text-sm text-gray-400 font-medium">
              {['Type de don', 'Détails', 'Localisation'][step - 1]}
            </div>
          </div>
        </div>

        <div className="card shadow-md">
          {/* Step 1: Type */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Que souhaitez-vous donner ?</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setForm({ ...form, type: 'FOOD', category: '' })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    form.type === 'FOOD'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/40'
                  }`}
                >
                  <div className="text-4xl mb-3">🥗</div>
                  <div className="font-bold text-gray-900">Nourriture</div>
                  <div className="text-xs text-gray-500 mt-1">Repas, fruits, légumes, produits secs...</div>
                  {form.type === 'FOOD' && (
                    <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Sélectionné
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setForm({ ...form, type: 'OBJECT', category: '', isHalal: false, preparedDate: '' })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    form.type === 'OBJECT'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
                  }`}
                >
                  <div className="text-4xl mb-3">📦</div>
                  <div className="font-bold text-gray-900">Objet</div>
                  <div className="text-xs text-gray-500 mt-1">Vêtements, meubles, livres, jouets...</div>
                  {form.type === 'OBJECT' && (
                    <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Sélectionné
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Décrivez votre {form.type === 'FOOD' ? 'don alimentaire' : 'objet'}
              </h2>

              <div>
                <label className="label">Titre de l'annonce *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={form.type === 'FOOD' ? 'Ex: Tajine poulet pour 4 personnes' : 'Ex: Veste d\'hiver taille M'}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={80}
                />
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder={form.type === 'FOOD' ? 'Ingrédients, quantité, conservation...' : 'État, taille, couleur, marque...'}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
              </div>

              <div>
                <label className="label">Catégorie *</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {(form.type === 'FOOD' ? FOOD_CATS : OBJ_CATS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {form.type === 'FOOD' && (
                <>
                  <div>
                    <label className="label">Date de préparation</label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.preparedDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm({ ...form, preparedDate: e.target.value })}
                    />
                  </div>

                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-amber-200 bg-amber-50 cursor-pointer hover:bg-amber-100 transition-all">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        form.isHalal ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
                      }`}
                      onClick={() => setForm({ ...form, isHalal: !form.isHalal })}
                    >
                      {form.isHalal && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div>
                      <div className="font-semibold text-amber-800 flex items-center gap-1.5 text-sm">
                        <Moon size={15} /> Certifié Hallal (déclaration sur l'honneur)
                      </div>
                      <div className="text-xs text-amber-600 mt-0.5">Je certifie que ce don respecte les exigences halal</div>
                    </div>
                  </label>
                </>
              )}
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Où récupérer le don ?</h2>
              <p className="text-sm text-gray-500 mb-3">
                Votre adresse exacte ne sera pas publiée — seul le quartier sera visible.
              </p>

              <button
                onClick={detectLocation}
                disabled={geoLoading}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-all disabled:opacity-60"
              >
                {geoLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Détection en cours...</>
                ) : (
                  <><MapPin size={18} /> Utiliser ma position actuelle</>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">ou entrez manuellement</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div>
                <label className="label">Adresse / Quartier *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Rue de la Paix, Paris 75001"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="48.8566"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="2.3522"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  />
                </div>
              </div>

              {/* Preview card */}
              {form.title && form.address && (
                <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium mb-2">APERÇU DE L'ANNONCE</p>
                  <div className="flex items-start gap-2">
                    <span className={form.type === 'FOOD' ? 'badge-food' : 'badge-object'}>
                      {form.type === 'FOOD' ? '🥗 Nourriture' : '📦 Objet'}
                    </span>
                    {form.isHalal && <span className="badge-halal">🌙 Hallal</span>}
                  </div>
                  <p className="font-bold text-gray-800 mt-2 text-sm">{form.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{form.description}</p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <MapPin size={11} /> {form.address}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-ghost flex-shrink-0">
                <ChevronLeft size={18} /> Retour
              </button>
            )}
            <div className="flex-1" />
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="btn-green">
                Suivant <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canNext() || loading} className="btn-green">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Publication...
                  </span>
                ) : (
                  '🌱 Publier le don'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
