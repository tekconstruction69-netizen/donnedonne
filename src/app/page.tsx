import Link from 'next/link';
import { Leaf, MapPin, Shield, Heart, ArrowRight, Recycle, Users, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-400 to-blue-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoNnY2aC02di02em0tNiAwaDZ2NmgtNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Recycle size={16} />
              Plateforme solidaire • Zéro gaspillage
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Donnez ce dont vous n'avez plus besoin.
              <br />
              <span className="text-white/80">Aidez ceux qui en ont besoin.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl">
              Rejoignez la communauté solidaire de Donnedonne.fr — échangez nourriture et objets
              gratuitement près de chez vous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-3 bg-white text-emerald-700 font-bold text-lg rounded-2xl px-8 py-4 hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <Heart size={22} />
                Je veux donner
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-3 bg-white/15 backdrop-blur-sm border-2 border-white/40 text-white font-bold text-lg rounded-2xl px-8 py-4 hover:bg-white/25 transition-all active:scale-[0.98]"
              >
                <MapPin size={22} />
                Je cherche un don
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            {[
              { value: '100%', label: 'Gratuit' },
              { value: '🛡️', label: 'Sécurisé & anonyme' },
              { value: '🌿', label: 'Anti-gaspillage' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Comment ça marche ?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Simple, rapide et sécurisé — en 3 étapes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '📝',
                title: 'Créez votre compte',
                desc: "Inscription en 30 secondes. Votre identité est protégée, les échanges restent anonymes.",
                color: 'bg-emerald-50 border-emerald-100',
                num: 'text-emerald-500',
              },
              {
                step: '02',
                icon: '📍',
                title: 'Publiez ou cherchez',
                desc: "Publiez une annonce en quelques clics, ou parcourez les dons disponibles autour de vous sur la carte.",
                color: 'bg-blue-50 border-blue-100',
                num: 'text-blue-500',
              },
              {
                step: '03',
                icon: '🤝',
                title: 'Échangez en confiance',
                desc: "Convenez d'un rendez-vous via la messagerie anonymisée. Récupérez votre don.",
                color: 'bg-purple-50 border-purple-100',
                num: 'text-purple-500',
              },
            ].map((item) => (
              <div key={item.step} className={`card border ${item.color} relative overflow-hidden`}>
                <div className={`absolute top-4 right-4 text-5xl font-black opacity-10 ${item.num}`}>
                  {item.step}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Que peut-on donner ?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🥗', label: 'Repas cuisinés', sub: 'Option Hallal disponible', color: 'hover:border-emerald-300 hover:bg-emerald-50' },
              { emoji: '🥦', label: 'Fruits & Légumes', sub: 'Frais du jardin', color: 'hover:border-emerald-300 hover:bg-emerald-50' },
              { emoji: '👕', label: 'Vêtements', sub: 'Toutes tailles', color: 'hover:border-blue-300 hover:bg-blue-50' },
              { emoji: '👟', label: 'Chaussures', sub: 'Adultes & enfants', color: 'hover:border-blue-300 hover:bg-blue-50' },
              { emoji: '🛏️', label: 'Literie', sub: 'Lits, matelas, couettes', color: 'hover:border-blue-300 hover:bg-blue-50' },
              { emoji: '📚', label: 'Livres & Jouets', sub: 'Pour enfants et adultes', color: 'hover:border-blue-300 hover:bg-blue-50' },
              { emoji: '🍞', label: 'Boulangerie', sub: 'Pain, viennoiseries', color: 'hover:border-emerald-300 hover:bg-emerald-50' },
              { emoji: '💻', label: 'Électronique', sub: 'En état de marche', color: 'hover:border-blue-300 hover:bg-blue-50' },
            ].map((cat) => (
              <div
                key={cat.label}
                className={`bg-white border-2 border-gray-100 rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${cat.color}`}
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="font-semibold text-gray-800 text-sm">{cat.label}</div>
                <div className="text-xs text-gray-400 mt-1">{cat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Votre sécurité, notre priorité
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Conçu "by Privasi" — confidentialité et confiance au cœur de chaque échange.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield size={28} />,
                title: 'Identité protégée',
                desc: 'Votre vrai nom et vos coordonnées ne sont jamais partagés. Les échanges se font sous pseudonyme.',
              },
              {
                icon: <Users size={28} />,
                title: 'Signalement actif',
                desc: '3 signalements = suspension automatique du compte. Notre équipe vérifie chaque cas.',
              },
              {
                icon: <CheckCircle size={28} />,
                title: 'Clause de sécurité',
                desc: "Chaque utilisateur accepte une charte d'hygiène et de responsabilité à l'inscription.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-400">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-5xl mb-6">🌱</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Inscription gratuite en moins d'une minute.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl px-10 py-4 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          >
            Rejoindre Donnedonne.fr
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-md flex items-center justify-center">
              <Leaf size={11} className="text-white" />
            </span>
            <span className="font-semibold text-gray-600">donnedonne.fr</span>
          </div>
          <p>Plateforme de don solidaire • Zéro gaspillage • 100% gratuit</p>
          <p className="mt-1">© {new Date().getFullYear()} Donnedonne.fr — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
