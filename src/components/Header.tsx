import React, { useState } from 'react';
import { Send, Trophy, Crown, Share2, Check, Lock } from 'lucide-react';

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

  const handleShare = async () => {
    const shareUrl = 'https://le-petit-oracle.vercel.app/';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Le Petit Oracle',
          url: shareUrl,
        });
      } catch {
        // Ignorer si l'utilisateur annule le menu de partage
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs px-4 md:px-12 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Image */}
        <div 
          onClick={() => onTabChange('form')}
          className="cursor-pointer group py-1"
        >
          <img 
            src="/assets/logo.png" 
            alt="Le Petit Oracle" 
            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
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

          {/* Share Button (Même hauteur que le nav toggle 50px) */}
          <button
            onClick={handleShare}
            className="h-[50px] bg-white/80 hover:bg-white text-slate-700 font-semibold px-5 rounded-full border border-stone-200/90 shadow-sm text-sm flex items-center gap-2 transition cursor-pointer active:scale-95"
            title="Partager à la famille"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
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
