import React, { useState } from 'react';
import { Moon, Sparkles, Send, Trophy, Crown, Share2, Check, Lock } from 'lucide-react';

interface HeaderProps {
  activeTab: 'form' | 'leaderboard' | 'parents';
  onTabChange: (tab: 'form' | 'leaderboard' | 'parents') => void;
  predictionCount: number;
  isParentsAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  predictionCount,
  isParentsAuthenticated,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Le Petit Oracle - Pronostics de Naissance',
        text: 'Fais ton pronostic sur la naissance du bébé (date, sexe, prénom, poids et taille) ! 👶✨',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F7F9F6]/90 backdrop-blur-md border-b border-stone-200/60 px-4 md:px-12 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Brand Title */}
        <div 
          onClick={() => onTabChange('form')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-100 to-amber-200 border border-amber-300/80 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <div className="relative">
              <Moon className="w-6 h-6 text-amber-700 fill-amber-300" />
              <Sparkles className="w-3.5 h-3.5 text-amber-600 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold tracking-tight text-slate-800">
              Le Petit Oracle
            </span>
            <span className="text-[10px] text-teal-800 font-bold tracking-wider uppercase">
              Pronostics Familiaux de Naissance
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-3">
          <nav className="flex items-center gap-1.5 bg-white/80 p-1.5 rounded-full border border-stone-200/90 shadow-sm text-sm font-medium">
            <button
              onClick={() => onTabChange('form')}
              className={`px-5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-[#E3EFE9] text-teal-900 font-bold shadow-inner'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/80'
              }`}
            >
              Faire un Pronostic
            </button>

            <button
              onClick={() => onTabChange('leaderboard')}
              className={`px-5 py-2 rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-[#E3EFE9] text-teal-900 font-bold shadow-inner'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/80'
              }`}
            >
              <span>Classement</span>
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {predictionCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('parents')}
              className={`px-5 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'parents'
                  ? 'bg-amber-100/90 text-amber-950 font-bold shadow-inner border border-amber-300'
                  : 'text-amber-800/90 hover:text-amber-950 hover:bg-amber-50/70'
              }`}
            >
              <span>Mode Parents</span>
              {isParentsAuthenticated ? (
                <Crown className="w-4 h-4 text-amber-600 inline-block" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-700/80 inline-block" />
              )}
            </button>
          </nav>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="bg-white/80 hover:bg-white text-slate-700 font-semibold px-3.5 py-2 rounded-full border border-stone-200/90 shadow-sm text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            title="Partager à la famille"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copied ? 'Lien copié !' : 'Partager'}</span>
          </button>
        </div>

        {/* Mobile Tab Quick Switch & Share */}
        <div className="md:hidden flex gap-1.5 bg-white/80 p-1 rounded-2xl border border-stone-200">
          <button
            onClick={() => onTabChange('form')}
            className={`p-2.5 rounded-xl transition ${
              activeTab === 'form' ? 'bg-[#528F79] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
            }`}
            title="Pronostic"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`p-2.5 rounded-xl transition ${
              activeTab === 'leaderboard' ? 'bg-[#528F79] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
            }`}
            title="Classement"
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTabChange('parents')}
            className={`p-2.5 rounded-xl transition ${
              activeTab === 'parents' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-800 hover:bg-amber-50'
            }`}
            title="Mode Parents"
          >
            {isParentsAuthenticated ? <Crown className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-stone-100 transition"
            title="Partager"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
