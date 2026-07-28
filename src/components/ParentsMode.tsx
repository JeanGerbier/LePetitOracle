import React, { useState, useMemo, useEffect } from 'react';
import { Prediction, ActualBirthData } from '../types/prediction';
import { calculateFinalScore } from '../utils/scoring';
import { Crown, Trophy, ChevronDown, ChevronUp, Save, LogOut, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParentsModeProps {
  predictions: Prediction[];
  actualData: ActualBirthData;
  onSaveActualData: (data: ActualBirthData) => Promise<void>;
  onLogout: () => void;
}

export const ParentsMode: React.FC<ParentsModeProps> = ({
  predictions,
  actualData: initialActualData,
  onSaveActualData,
  onLogout,
}) => {
  const [actualData, setActualData] = useState<ActualBirthData>(initialActualData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setActualData(initialActualData);
  }, [initialActualData]);

  const formatWhoCries = (val: string) => {
    switch (val) {
      case 'maman':
        return '🤱 La maman';
      case 'papa':
        return '🧔 Le papa';
      case 'les_deux':
        return '😭 Les parents';
      default:
        return val || '-';
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
      return isoString || '-';
    }
  };



  // Helper date/time inputs sans décalage de fuseau horaire (UTC vs Locale)
  const getLocalYYYYMMDD = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr.substring(0, 10);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return isoStr.substring(0, 10);
    }
  };

  const getLocalHHMM = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr.substring(11, 16);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return isoStr.substring(11, 16);
    }
  };

  const rawDateOnly = getLocalYYYYMMDD(actualData.birth_date);
  const rawTimeOnly = getLocalHHMM(actualData.birth_date);

  const handleDateChange = (newDateStr: string) => {
    if (!newDateStr) return;
    const [year, month, day] = newDateStr.split('-').map(Number);
    const [hours, minutes] = rawTimeOnly.split(':').map(Number);
    const d = new Date(year, month - 1, day, hours || 0, minutes || 0);
    setActualData(prev => ({
      ...prev,
      birth_date: d.toISOString()
    }));
  };

  const handleTimeChange = (newTimeStr: string) => {
    if (!newTimeStr) return;
    const [year, month, day] = rawDateOnly.split('-').map(Number);
    const [hours, minutes] = newTimeStr.split(':').map(Number);
    const d = new Date(year, month - 1, day, hours || 0, minutes || 0);
    setActualData(prev => ({
      ...prev,
      birth_date: d.toISOString()
    }));
  };

  const calculatedLeaderboard = useMemo(() => {
    return predictions
      .map(pred => calculateFinalScore(pred, actualData))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [predictions, actualData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveActualData(actualData);
      setSavedSuccess(true);
      
      // Explosion de confettis !
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });

      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-50 border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-200/90 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-700" /> Espace Réservé aux Parents 👑
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-3">
            Renseigner les Vraies Données de la Naissance
          </h1>
          <p className="text-xs sm:text-sm text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
            Saisissez les informations officielles du jour J pour calculer instantanément les scores exacts et désigner le Grand Oracle !
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={onLogout}
            className="bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-stone-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Se déconnecter du mode parents"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Section 1: Inputs grid */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <h2 className="font-bold text-slate-800 text-lg sm:text-xl flex items-center gap-2">
            <span>📝</span> 1. Saisie des informations réelles de la naissance
          </h2>
          <span className="text-xs text-slate-400 font-medium">Saisie Officielle Parents</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Prénom Officiel</label>
            <input
              type="text"
              value={actualData.first_name}
              onChange={(e) => setActualData({ ...actualData, first_name: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Sexe Réel</label>
            <select
              value={actualData.gender}
              onChange={(e) => setActualData({ ...actualData, gender: e.target.value as any })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="fille">🍳 Fille</option>
              <option value="garcon">⛵ Garçon</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Qui a pleuré en 1er ?</label>
            <select
              value={actualData.who_cried_first}
              onChange={(e) => setActualData({ ...actualData, who_cried_first: e.target.value as any })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="maman">🤱 La Maman</option>
              <option value="papa">🧔 Le Papa</option>
              <option value="les_deux">😭 Les parents en même temps</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Date exacte</label>
            <input
              type="date"
              value={rawDateOnly}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Heure exacte</label>
            <input
              type="time"
              value={rawTimeOnly}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Poids exact (g)</label>
            <input
              type="number"
              step="10"
              value={actualData.weight_grams}
              onChange={(e) => setActualData({ ...actualData, weight_grams: Number(e.target.value) })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Taille exacte (cm)</label>
            <input
              type="number"
              step="1"
              value={actualData.height_cm}
              onChange={(e) => setActualData({ ...actualData, height_cm: Number(e.target.value) })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Big Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>
              {isSaving
                ? 'Sauvegarde...'
                : savedSuccess
                ? 'Résultats enregistrés et publiés ! 🎉'
                : 'Publier les résultats officiels'}
            </span>
          </button>
        </div>
      </div>

      {/* Section 2: Calculated Podium Results */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-4">
          <h2 className="font-bold text-slate-800 text-lg sm:text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>2. Classement & Grand Gagnant Calculé</span>
          </h2>
          <span className="text-xs text-teal-800 font-semibold bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            ⚡ Recalculé automatiquement
          </span>
        </div>

        <div className="space-y-3">
          {calculatedLeaderboard.map((rank, index) => {
            const isWinner = index === 0;
            const isExpanded = expandedId === rank.id;

            return (
              <div
                key={rank.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isWinner
                    ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-300 shadow-md'
                    : 'bg-stone-50/80 border-stone-200 hover:bg-stone-100/60'
                }`}
              >
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : rank.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                      isWinner ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-stone-200 text-slate-700'
                    }`}>
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-base">{rank.user_name}</h4>
                        {isWinner && (
                          <span className="bg-amber-200 text-amber-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1">
                            🏆 Grand Oracle
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Prénom deviné : <span className="font-bold text-slate-700">{rank.first_name_guess || 'Secret'}</span> ({rank.gender})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-black text-teal-900 block leading-tight">
                        {rank.totalScore} pts
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Score final</span>
                    </div>

                    <button 
                      type="button"
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Detailed predictions and score breakdown dropdown */}
                {isExpanded && (
                  <div className="bg-white/90 border-t border-stone-200/80 p-4 space-y-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Détail du pari de {rank.user_name} :
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 flex flex-col justify-between">
                        <span className="text-slate-400 block text-[10px] font-medium">Sexe parié</span>
                        <span className="font-bold text-slate-800">{rank.gender === 'fille' ? '🍳 Fille' : '⛵ Garçon'}</span>
                        <span className="text-[10px] font-bold text-teal-700 mt-1">+{rank.genderScore} pts</span>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 flex flex-col justify-between">
                        <span className="text-slate-400 block text-[10px] font-medium">Prénom deviné</span>
                        <span className="font-bold text-slate-800">{rank.first_name_guess || 'Secret'}</span>
                        <span className="text-[10px] font-bold text-teal-700 mt-1">+{rank.firstNameScore} pts</span>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 flex flex-col justify-between">
                        <span className="text-slate-400 block text-[10px] font-medium">Date & Heure</span>
                        <span className="font-bold text-slate-800">{formatDateString(rank.birth_date)}</span>
                        <span className="text-[10px] font-bold text-teal-700 mt-1">+{rank.dateTimeScore} pts</span>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 flex flex-col justify-between">
                        <span className="text-slate-400 block text-[10px] font-medium">1er Pleur</span>
                        <span className="font-bold text-slate-800">{formatWhoCries(rank.who_cries_first)}</span>
                        <span className="text-[10px] font-bold text-teal-700 mt-1">+{rank.criesScore} pts</span>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 flex flex-col justify-between">
                        <span className="text-slate-400 block text-[10px] font-medium">Poids deviné</span>
                        <span className="font-bold text-slate-800">{rank.weight_grams} g</span>
                        <span className="text-[10px] font-bold text-teal-700 mt-1">+{rank.weightScore} pts</span>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 flex flex-col justify-between">
                        <span className="text-slate-400 block text-[10px] font-medium">Taille devinée</span>
                        <span className="font-bold text-slate-800">{rank.height_cm} cm</span>
                        <span className="text-[10px] font-bold text-teal-700 mt-1">+{rank.heightScore} pts</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
