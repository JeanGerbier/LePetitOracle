import React from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { ScoreBreakdown } from '../types/prediction';

interface ScoreSidebarProps {
  scoreBreakdown: ScoreBreakdown;
  isSubmitting?: boolean;
}

export const ScoreSidebar: React.FC<ScoreSidebarProps> = ({
  scoreBreakdown,
  isSubmitting = false,
}) => {
  return (
    <div className="bg-[#E3EFE9]/90 border border-[#BDE0D0] rounded-3xl p-6 shadow-sm sticky top-24 space-y-6">
      
      {/* Sidebar Header */}
      <div>
        <h3 className="text-xl font-serif font-bold text-slate-800 leading-snug">
          Aperçu de Votre Score Potentiel
        </h3>
        <p className="text-xs text-teal-900/70 mt-1">
          Score estimé si vos prédictions s'avèrent exactes !
        </p>
      </div>

      {/* Point Breakdown List */}
      <div className="space-y-3 text-sm pt-1">
        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="text-xs">🎀</span> Sexe Exact
          </span>
          <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-xs transition-colors ${
            scoreBreakdown.genderPts > 0 
              ? 'text-teal-900 bg-white/90 border-teal-300 shadow-xs' 
              : 'text-slate-400 bg-stone-100/50 border-stone-200'
          }`}>
            +{scoreBreakdown.genderPts} pts
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="text-xs">✏️</span> Prénom Exact
          </span>
          <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-xs transition-colors ${
            scoreBreakdown.firstNamePts > 0 
              ? 'text-teal-900 bg-white/90 border-teal-300 shadow-xs' 
              : 'text-slate-400 bg-stone-100/50 border-stone-200'
          }`}>
            +{scoreBreakdown.firstNamePts} pts
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="text-xs">📅</span> Heure Exacte
          </span>
          <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-xs transition-colors ${
            scoreBreakdown.dateTimePts > 0 
              ? 'text-teal-900 bg-white/90 border-teal-300 shadow-xs' 
              : 'text-slate-400 bg-stone-100/50 border-stone-200'
          }`}>
            +{scoreBreakdown.dateTimePts} pts
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="text-xs">😭</span> Premier Pleur
          </span>
          <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-xs transition-colors ${
            scoreBreakdown.criesPts > 0 
              ? 'text-teal-900 bg-white/90 border-teal-300 shadow-xs' 
              : 'text-slate-400 bg-stone-100/50 border-stone-200'
          }`}>
            +{scoreBreakdown.criesPts} pts
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="text-xs">⚖️</span> Poids Exact
          </span>
          <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-xs transition-colors ${
            scoreBreakdown.weightPts > 0 
              ? 'text-teal-900 bg-white/90 border-teal-300 shadow-xs' 
              : 'text-slate-400 bg-stone-100/50 border-stone-200'
          }`}>
            +{scoreBreakdown.weightPts} pts
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="text-xs">📏</span> Taille Exacte
          </span>
          <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-xs transition-colors ${
            scoreBreakdown.heightPts > 0 
              ? 'text-teal-900 bg-white/90 border-teal-300 shadow-xs' 
              : 'text-slate-400 bg-stone-100/50 border-stone-200'
          }`}>
            +{scoreBreakdown.heightPts} pts
          </span>
        </div>
      </div>

      <hr className="border-teal-200/80 my-4" />

      {/* Total Score Display */}
      <div className="flex justify-between items-center">
        <span className="text-slate-800 font-bold text-base">Total Max</span>
        <span className="text-3xl font-black text-teal-950 tracking-tight">
          +{scoreBreakdown.totalPossible} pts
        </span>
      </div>

      {/* Big Green Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#528F79] hover:bg-[#437A66] disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base active:scale-98 cursor-pointer"
      >
        <span>{isSubmitting ? 'Enregistrement...' : 'Soumettre mon Pronostic'}</span>
        <Send className="w-4 h-4" />
      </button>

      <div className="text-center pt-1">
        <span className="text-[11px] text-amber-900/80 font-medium inline-flex items-center gap-1.5 justify-center">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" /> Ne pourra plus être modifié une fois envoyé
        </span>
      </div>

    </div>
  );
};
