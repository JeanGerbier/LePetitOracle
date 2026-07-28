import React, { useState } from 'react';
import { Crown, KeyRound, AlertCircle } from 'lucide-react';

interface ParentsAuthModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParentsAuthModal: React.FC<ParentsAuthModalProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const expectedUsername = import.meta.env.VITE_PARENTS_USERNAME || 'parents';
  const expectedPassword = import.meta.env.VITE_PARENTS_PASSWORD || 'oracle2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      usernameInput.trim().toLowerCase() === expectedUsername.toLowerCase() &&
      passwordInput.trim() === expectedPassword
    ) {
      sessionStorage.setItem('parents_authenticated', 'true');
      onSuccess();
    } else {
      setErrorMsg('Identifiant ou mot de passe incorrect.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 text-amber-800 mx-auto flex items-center justify-center text-2xl shadow-inner">
            <Crown className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            Accès Mode Parents
          </h3>
          <p className="text-xs text-slate-500">
            Veuillez entrer les identifiants parents pour accéder à l'administration des résultats réels.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Identifiant</label>
            <div className="relative">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="ex: parents"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-1/2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Déverrouiller</span>
            </button>
          </div>
        </form>

        <div className="text-center pt-1 border-t border-stone-100">
          <span className="text-[10px] text-slate-400">
            Identifiants configurés dans <code className="bg-stone-100 px-1 py-0.5 rounded text-slate-600">.env.local</code>
          </span>
        </div>

      </div>
    </div>
  );
};
