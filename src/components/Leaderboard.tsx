import React from 'react';
import { Prediction } from '../types/prediction';
import { Sparkles } from 'lucide-react';
import { capitalizeName } from '../utils/scoring';

interface LeaderboardProps {
  predictions: Prediction[];
  onAddNew: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  predictions,
}) => {
  const formatWhoCries = (val: string) => {
    switch (val) {
      case 'maman':
        return 'La maman';
      case 'papa':
        return 'Le papa';
      case 'les_deux':
        return 'Les deux';
      default:
        return val;
    }
  };

  const formatDateString = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${day} à ${time}`;
    } catch {
      return isoString;
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Prophétisé récemment';
    try {
      const createdDate = new Date(isoString);
      if (isNaN(createdDate.getTime())) return 'Prophétisé récemment';

      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return "Prophétisé à l'instant";
      if (diffMinutes < 60) return `Prophétisé il y a ${diffMinutes} min`;
      if (diffHours < 24) return `Prophétisé il y a ${diffHours}h`;
      if (diffDays === 1) return 'Prophétisé hier';
      if (diffDays < 7) return `Prophétisé il y a ${diffDays}j`;

      return `Prophétisé le ${createdDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
    } catch {
      return 'Prophétisé récemment';
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      
      {/* Top Title Header Bar */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-800">
          Le mural des prédictions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Parcourez les prédictions et présages scellés par toute la tribu !
        </p>
      </div>

      {/* Grid of Predictions */}
      {predictions.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">Aucun pronostic pour le moment !</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Soyez la toute première personne de la famille à donner votre avis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {predictions.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              {/* Card Top Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100/90 border border-amber-300 flex items-center justify-center font-extrabold text-amber-900 text-lg shadow-xs shrink-0">
                    {capitalizeName(item.user_name).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 text-base leading-tight break-words">{capitalizeName(item.user_name)}</h3>
                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                </div>

                <span className={`text-xs px-3 py-1 rounded-full font-bold border shrink-0 whitespace-nowrap ${
                  item.gender === 'fille'
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : 'bg-teal-50 text-teal-800 border-teal-200'
                }`}>
                  {item.gender === 'fille' ? '🌸 Fille' : '🚀 Garçon'}
                </span>
              </div>

              {/* Data Grid Summary */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50/80 border border-stone-200/50 p-3.5 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Date & heure</span>
                  <span className="font-bold text-slate-800">{formatDateString(item.birth_date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Prénom deviné</span>
                  <span className="font-bold text-slate-800">{item.first_name_guess || 'Secret !'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Qui pleure ?</span>
                  <span className="font-bold text-slate-800">{formatWhoCries(item.who_cries_first)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Gabarit</span>
                  <span className="font-bold text-slate-800">{item.weight_grams}g | {item.height_cm}cm</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
