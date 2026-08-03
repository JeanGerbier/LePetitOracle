import React from 'react';
import { Prediction, ActualBirthData } from '../types/prediction';
import { calculateFinalScore, formatOracleName } from '../utils/scoring';
import { Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BirthResultsViewProps {
  predictions: Prediction[];
  actualBirthData: ActualBirthData;
}

export const BirthResultsView: React.FC<BirthResultsViewProps> = ({
  predictions,
  actualBirthData,
}) => {
  // Trigger celebratory confetti when the view loads
  React.useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.4 }
      });
    } catch {
      // Ignorer
    }
  }, []);

  const rankedPredictions = React.useMemo(() => {
    return predictions
      .map((p) => {
        const scores = calculateFinalScore(p, actualBirthData);
        return {
          ...p,
          ...scores,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [predictions, actualBirthData]);

  const grandWinner = rankedPredictions[0];

  const formatWhoCries = (val: string) => {
    switch (val) {
      case 'maman':
        return 'La Maman';
      case 'papa':
        return 'Le Papa';
      case 'les_deux':
        return 'Les deux';
      default:
        return val;
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* --- HERO BANNER ANNONCE DE NAISSANCE --- */}
      <div className="bg-gradient-to-br from-[#FDF7EA] via-amber-50 to-[#E3EFE9] border-2 border-amber-300/80 rounded-3xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-amber-200/80 text-amber-950 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs mb-4">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>Bébé est arrivé ! 🎉</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800 mb-1">
          Bienvenue au monde !
        </h1>

        {/* Prénom en très grand */}
        <h2 className="text-4xl sm:text-6xl font-serif font-black text-teal-900 tracking-tight my-2">
          {actualBirthData.first_name || 'Elena'}
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium">
          Les résultats officiels sont enregistrés. Voici le récapitulatif de la naissance et le classement final de la tribu !
        </p>

        {/* Fiche Officielle Bébé (5 cartes identiques) */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 max-w-4xl mx-auto">
          {/* Card 1: Sexe */}
          <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col items-center justify-center text-center">
            <img src={actualBirthData.gender === 'fille' ? '/assets/fille.png' : '/assets/garcon.png'} alt="Sexe" className="w-12 h-12 object-contain mb-1.5" />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Sexe</span>
            <span className="text-sm sm:text-base font-bold text-slate-800 capitalize">{actualBirthData.gender === 'fille' ? 'Fille' : 'Garçon'}</span>
          </div>

          {/* Card 2: Date & Heure */}
          <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col items-center justify-center text-center">
            <img src="/assets/date.png" alt="Date et Heure" className="w-12 h-12 object-contain mb-1.5" />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Date & Heure</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">{formatDate(actualBirthData.birth_date)}</span>
            <span className="text-xs text-slate-500 font-medium">{formatTime(actualBirthData.birth_date)}</span>
          </div>

          {/* Card 3: Premier Pleur */}
          <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col items-center justify-center text-center">
            <img 
              src={
                actualBirthData.who_cried_first === 'maman' 
                  ? '/assets/maman.png' 
                  : actualBirthData.who_cried_first === 'papa' 
                  ? '/assets/papa.png' 
                  : '/assets/papa-maman.png'
              } 
              alt="Premier Pleur" 
              className={`${actualBirthData.who_cried_first === 'les_deux' ? 'w-14 h-12' : 'w-12 h-12'} object-contain mb-1.5`} 
            />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Premier Pleur</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{formatWhoCries(actualBirthData.who_cried_first)}</span>
          </div>

          {/* Card 4: Poids */}
          <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col items-center justify-center text-center">
            <img src="/assets/poids.png" alt="Poids" className="w-12 h-12 object-contain mb-1.5" />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Poids</span>
            <span className="text-sm sm:text-base font-bold text-slate-800">{actualBirthData.weight_grams} g</span>
          </div>

          {/* Card 5: Taille */}
          <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col items-center justify-center text-center">
            <img src="/assets/taille.png" alt="Taille" className="w-12 h-12 object-contain mb-1.5" />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Taille</span>
            <span className="text-sm sm:text-base font-bold text-slate-800">{actualBirthData.height_cm} cm</span>
          </div>
        </div>
      </div>

      {/* --- LE GRAND GAGNANT / PODIUM --- */}
      {grandWinner && (
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 p-1 rounded-3xl shadow-md">
          <div className="bg-white rounded-[22px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100/80 border-2 border-amber-400/80 flex items-center justify-center shadow-sm shrink-0 p-2">
                <img src="/assets/coupe.png" alt="Le Grand Oracle" className="w-full h-full object-contain animate-bounce" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-100 text-amber-950 font-extrabold text-[11px] px-3 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                    🏆 Le Grand Oracle de la Tribu
                  </span>
                </div>
                <h2 className="text-3xl font-serif font-black text-slate-900">
                  {formatOracleName(grandWinner.user_name)}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  A obtenu le meilleur score de la tribu avec <span className="font-bold text-teal-800">{grandWinner.totalScore} points</span> sur 300 !
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-6 py-4 rounded-2xl text-center shrink-0">
              <span className="text-4xl font-black text-amber-950 block">
                {grandWinner.totalScore}
              </span>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Points Gagnés
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- LE CLASSEMENT FINAL COMPLET --- */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-700" />
          <h3 className="text-xl font-serif font-bold text-slate-800">
            Le classement final de la tribu ({rankedPredictions.length})
          </h3>
        </div>

        <div className="space-y-3">
          {rankedPredictions.map((item, index) => {
            const isWinner = index === 0;
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isWinner
                    ? 'bg-amber-50/90 border-amber-300 shadow-sm'
                    : 'bg-stone-50/80 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                    isWinner ? 'bg-amber-400 text-amber-950' : 'bg-stone-200 text-slate-700'
                  }`}>
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-base">{formatOracleName(item.user_name)}</h4>
                      {isWinner && (
                        <span className="bg-amber-200 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          🏆 Gagnant
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prénom parié : <span className="font-semibold text-slate-700">{item.first_name_guess || 'Secret'}</span> ({item.gender === 'fille' ? '🌸 Fille' : '🚀 Garçon'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-stone-200/60 pt-3 sm:pt-0">
                  <div className="text-right">
                    <span className="text-xl font-black text-teal-900 block">
                      {item.totalScore} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
