'use client';

import { useState, useRef } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

export default function DisclaimerModal({ onAccept, onDecline }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setScrolled(true);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Clause de non-responsabilité</h2>
            <p className="text-sm text-gray-500">Lisez attentivement avant de continuer</p>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-gray-600 leading-relaxed"
        >
          <p className="font-semibold text-gray-800">Sécurité alimentaire et hygiène</p>
          <p>
            Donnedonne.fr est une plateforme de mise en relation entre particuliers. Nous ne garantissons
            pas la qualité, la fraîcheur, ni la conformité des produits alimentaires échangés.
          </p>
          <p>
            En utilisant cette plateforme, vous reconnaissez et acceptez que :
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Les dons alimentaires sont effectués sous la seule responsabilité des donneurs.</li>
            <li>Donnedonne.fr ne peut être tenu responsable d'une intoxication alimentaire, d'une allergie ou d'un incident lié à la consommation de produits donnés.</li>
            <li>Il vous appartient de vérifier l'état, la fraîcheur et la conformité de tout aliment reçu avant consommation.</li>
            <li>Concernant le label "Hallal" : il s'agit d'une déclaration du donneur sur l'honneur. Donnedonne.fr ne certifie ni ne vérifie cette information.</li>
            <li>Les donneurs s'engagent à ne donner que des produits propres à la consommation et en bon état.</li>
            <li>Tout don d'objet est effectué en l'état. Le receveur est responsable de vérifier la conformité et la sécurité de l'objet reçu.</li>
          </ul>

          <p className="font-semibold text-gray-800 mt-4">Système de signalement</p>
          <p>
            Tout utilisateur ayant reçu 3 signalements vérifiés verra son compte automatiquement suspendu
            dans l'attente d'une vérification par notre équipe.
          </p>

          <p className="font-semibold text-gray-800 mt-4">Confidentialité</p>
          <p>
            Votre identité est connue de la plateforme, mais reste anonyme vis-à-vis des autres utilisateurs.
            Nous nous engageons à protéger vos données personnelles conformément au RGPD.
          </p>

          <p className="font-semibold text-gray-800 mt-4">Comportement attendu</p>
          <p>
            Vous vous engagez à utiliser cette plateforme de bonne foi, dans un esprit de solidarité et
            de partage. Tout abus sera sanctionné par la suspension définitive du compte.
          </p>

          {!scrolled && (
            <p className="text-center text-xs text-gray-400 italic pt-2">
              ↓ Continuez à défiler pour pouvoir accepter
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 space-y-4">
          {scrolled && (
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'
                }`}
                onClick={() => setChecked(!checked)}
              >
                {checked && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <span className="text-sm text-gray-700">
                J'ai lu et j'accepte la clause de non-responsabilité. Je comprends les risques associés aux échanges entre particuliers.
              </span>
            </label>
          )}

          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl py-3 transition-all"
            >
              Refuser
            </button>
            <button
              onClick={onAccept}
              disabled={!checked || !scrolled}
              className="flex-1 btn-green disabled:opacity-40"
            >
              Accepter et continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
