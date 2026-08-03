import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { formatOracleName } from '../utils/scoring';

interface SuccessModalProps {
  userName: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ userName, onClose }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignorer si non disponible
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl transform transition-all">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl shadow-inner">
          🚀
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">
            Pronostic Enregistré !
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Merci <span className="font-bold text-slate-900">{formatOracleName(userName)}</span> ! Vos choix sont précieusement enregistrés. Rendez-vous au jour J pour le calcul des points !
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#528F79] hover:bg-[#437A66] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
        >
          <span>C'est noté ! ✨</span>
        </button>
      </div>
    </div>
  );
};
