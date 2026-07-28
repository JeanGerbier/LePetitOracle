import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Prediction, WhoCriesFirst, Gender } from '../types/prediction';
import { calculatePotentialScore } from '../utils/scoring';
import { StepProgress } from './StepProgress';
import { ScoreSidebar } from './ScoreSidebar';

interface PredictionFormProps {
  onSubmit: (prediction: Omit<Prediction, 'id' | 'created_at'>) => Promise<void>;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit }) => {
  const [userName, setUserName] = useState('Camille L.');
  const [birthDate, setBirthDate] = useState('2026-08-15');
  const [birthHours, setBirthHours] = useState('01');
  const [birthMinutes, setBirthMinutes] = useState('00');
  const [gender, setGender] = useState<Gender>('fille');
  const [firstNameGuess, setFirstNameGuess] = useState('');
  const [whoCriesFirst, setWhoCriesFirst] = useState<WhoCriesFirst>('papa');
  const [weightGrams, setWeightGrams] = useState(3300);
  const [heightCm, setHeightCm] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scoreBreakdown = useMemo(() => {
    return calculatePotentialScore(
      gender,
      firstNameGuess,
      birthDate,
      birthHours,
      birthMinutes,
      whoCriesFirst,
      weightGrams,
      heightCm
    );
  }, [gender, firstNameGuess, birthDate, birthHours, birthMinutes, whoCriesFirst, weightGrams, heightCm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Veuillez entrer votre prénom ou pseudo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedHours = birthHours.padStart(2, '0');
      const formattedMinutes = birthMinutes.padStart(2, '0');
      const isoBirthDate = new Date(`${birthDate}T${formattedHours}:${formattedMinutes}:00`).toISOString();

      await onSubmit({
        user_name: userName.trim(),
        gender,
        birth_date: isoBirthDate,
        first_name_guess: firstNameGuess.trim(),
        who_cries_first: whoCriesFirst,
        weight_grams: weightGrams,
        height_cm: heightCm,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncrementHour = () => {
    setBirthHours(prev => String(Math.min(23, Number(prev) + 1)).padStart(2, '0'));
  };

  const handleDecrementHour = () => {
    setBirthHours(prev => String(Math.max(0, Number(prev) - 1)).padStart(2, '0'));
  };

  const handleIncrementMinute = () => {
    setBirthMinutes(prev => String(Math.min(59, Number(prev) + 1)).padStart(2, '0'));
  };

  const handleDecrementMinute = () => {
    setBirthMinutes(prev => String(Math.max(0, Number(prev) - 1)).padStart(2, '0'));
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-800">
            Le Formulaire des Pronostics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Remplissez vos intuitions et découvrez votre score potentiel !
          </p>
        </div>

        {/* User Identity Pill */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm w-full sm:w-auto">
          <div className="w-8 h-8 rounded-full bg-amber-200 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-sm shrink-0">
            👧
          </div>
          <div className="flex flex-col">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-sm font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 w-32"
              placeholder="Votre Prénom"
              required
            />
          </div>
        </div>
      </div>

      {/* Progress Step Bar */}
      <StepProgress currentStep={2} totalSteps={3} label="L'Arrivée" percent={65} />

      {/* Main Grid Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT & CENTER MAIN CONTENT (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* --- ROW 1: Date/Heure | Sexe | Prénom --- */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

            {/* Card 1: La Date et l'Heure */}
            <div className="md:col-span-5 bg-[#C9DCE5]/60 border border-[#B0CAD6] p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-sm transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/90 border border-[#9BBED0] flex items-center justify-center text-[#3D6B82] shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-800 text-base">
                  La Date et l'Heure
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Date estimée</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white/90 border border-[#A7C8D8] rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Heure</label>
                    <div className="flex items-center bg-white/90 border border-[#A7C8D8] rounded-xl px-2 py-1 shadow-xs">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={birthHours}
                        onChange={(e) => setBirthHours(e.target.value)}
                        className="w-full text-center bg-transparent text-sm font-bold text-slate-800 focus:outline-none"
                      />
                      <div className="flex flex-col text-[10px] text-slate-500 border-l border-stone-200 pl-1">
                        <button type="button" onClick={handleIncrementHour} className="hover:text-teal-700 font-bold px-1">▲</button>
                        <button type="button" onClick={handleDecrementHour} className="hover:text-teal-700 font-bold px-1">▼</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Minute</label>
                    <div className="flex items-center bg-white/90 border border-[#A7C8D8] rounded-xl px-2 py-1 shadow-xs">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={birthMinutes}
                        onChange={(e) => setBirthMinutes(e.target.value)}
                        className="w-full text-center bg-transparent text-sm font-bold text-slate-800 focus:outline-none"
                      />
                      <div className="flex flex-col text-[10px] text-slate-500 border-l border-stone-200 pl-1">
                        <button type="button" onClick={handleIncrementMinute} className="hover:text-teal-700 font-bold px-1">▲</button>
                        <button type="button" onClick={handleDecrementMinute} className="hover:text-teal-700 font-bold px-1">▼</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Le Sexe */}
            <div className="md:col-span-4 bg-[#F2EDE2]/80 border border-[#E3DAC8] p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-sm transition">
              <span className="font-bold text-slate-800 text-base mb-3 block">
                Le Sexe
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('fille')}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    gender === 'fille'
                      ? 'bg-[#F2E5CE] border-amber-400 ring-2 ring-amber-300 shadow-sm text-slate-900 font-bold transform -translate-y-0.5'
                      : 'bg-white/80 border-stone-200 hover:bg-white text-slate-600'
                  }`}
                >
                  <span className="text-2xl">👗</span>
                  <span className="text-xs font-bold">Fille</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender('garcon')}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    gender === 'garcon'
                      ? 'bg-[#F2E5CE] border-amber-400 ring-2 ring-amber-300 shadow-sm text-slate-900 font-bold transform -translate-y-0.5'
                      : 'bg-white/80 border-stone-200 hover:bg-white text-slate-600'
                  }`}
                >
                  <span className="text-2xl">🎀</span>
                  <span className="text-xs font-bold">Garçon</span>
                </button>
              </div>
            </div>

            {/* Card 3: Le Prénom */}
            <div className="md:col-span-3 bg-[#E3EFE9]/70 border border-[#C5DED2] p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-sm transition">
              <span className="font-bold text-slate-800 text-base mb-3 block">
                Le Prénom
              </span>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Votre idée..."
                    value={firstNameGuess}
                    onChange={(e) => setFirstNameGuess(e.target.value)}
                    className="w-full bg-white/90 border border-[#A8CDC0] rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs pr-8"
                  />
                  <span className="absolute right-2.5 top-3 text-stone-400 text-xs">✏️</span>
                </div>
                <p className="text-[11px] text-teal-800/80 italic font-medium leading-tight">
                  Secret gardé jusqu'à la naissance !
                </p>
              </div>
            </div>

          </div>

          {/* --- ROW 2: Qui pleurera en premier ? --- */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <span>😭</span> Qui pleurera en premier ?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              
              {/* Left Green Baby Card */}
              <div className="sm:col-span-3 bg-[#6B9E8B] text-white p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-md min-h-[140px]">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-2 backdrop-blur-xs">
                  👶
                </div>
                <span className="text-xs font-extrabold tracking-wider uppercase opacity-95">
                  Émotion Pure
                </span>
              </div>

              {/* 4 Interactive Option Cards */}
              <div className="sm:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'bebe', label: 'Le Bébé', icon: '🍼' },
                  { id: 'maman', label: 'La Maman', icon: '🤱' },
                  { id: 'papa', label: 'Le Papa', icon: '🧔' },
                  { id: 'les_deux', label: 'Les deux parents', icon: '😭' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setWhoCriesFirst(option.id as WhoCriesFirst)}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center h-32 cursor-pointer ${
                      whoCriesFirst === option.id
                        ? 'bg-[#FDF7EA] border-amber-400 ring-2 ring-amber-300 shadow-md transform -translate-y-0.5'
                        : 'bg-stone-50/80 border-stone-200 hover:bg-stone-100 text-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-2xl border border-stone-100">
                      {option.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* --- ROW 3: Poids (g) & Taille (cm) --- */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Poids Slider & Input */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>⚖️</span> Poids (g)
                </label>
                <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-3 py-1 rounded-xl">
                  <input
                    type="number"
                    step="50"
                    min="2000"
                    max="5000"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(Number(e.target.value))}
                    className="w-16 text-right font-bold text-slate-800 text-sm bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-semibold">g</span>
                </div>
              </div>
              <input
                type="range"
                min="2200"
                max="4800"
                step="50"
                value={weightGrams}
                onChange={(e) => setWeightGrams(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-medium text-stone-400 mt-1.5">
                <span>2200g</span>
                <span className="text-teal-800 font-semibold">3500g (Moyenne)</span>
                <span>4800g</span>
              </div>
            </div>

            {/* Taille Slider & Input */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>📏</span> Taille (cm)
                </label>
                <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-3 py-1 rounded-xl">
                  <input
                    type="number"
                    step="1"
                    min="40"
                    max="60"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-16 text-right font-bold text-slate-800 text-sm bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-semibold">cm</span>
                </div>
              </div>
              <input
                type="range"
                min="42"
                max="58"
                step="1"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-medium text-stone-400 mt-1.5">
                <span>42 cm</span>
                <span className="text-teal-800 font-semibold">50 cm (Moyenne)</span>
                <span>58 cm</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR (4 cols) */}
        <div className="lg:col-span-4">
          <ScoreSidebar scoreBreakdown={scoreBreakdown} isSubmitting={isSubmitting} />
        </div>

      </form>
    </div>
  );
};
