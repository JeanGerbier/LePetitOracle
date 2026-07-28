import React, { useState, useMemo } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { Prediction, WhoCriesFirst, Gender } from '../types/prediction';
import { calculatePotentialScore } from '../utils/scoring';
import { checkIfPredictionExists } from '../lib/supabase';
import { StepProgress } from './StepProgress';
import { ScoreSidebar } from './ScoreSidebar';

interface PredictionFormProps {
  onSubmit: (prediction: Omit<Prediction, 'id' | 'created_at'>) => Promise<void>;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit }) => {
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthHours, setBirthHours] = useState('01');
  const [birthMinutes, setBirthMinutes] = useState('00');
  const [gender, setGender] = useState<Gender | null>(null);
  const [firstNameGuess, setFirstNameGuess] = useState('');
  const [whoCriesFirst, setWhoCriesFirst] = useState<WhoCriesFirst | null>(null);
  const [weightGrams, setWeightGrams] = useState(3300);
  const [heightCm, setHeightCm] = useState(50);
  const [hasTouchedSlider, setHasTouchedSlider] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');

  const scoreBreakdown = useMemo(() => {
    return calculatePotentialScore(
      gender || '',
      firstNameGuess,
      birthDate,
      birthHours,
      birthMinutes,
      whoCriesFirst || '',
      weightGrams,
      heightCm
    );
  }, [gender, firstNameGuess, birthDate, birthHours, birthMinutes, whoCriesFirst, weightGrams, heightCm]);

  const progressPercent = useMemo(() => {
    let filled = 0;
    const total = 6;

    if (userName.trim().length > 0) filled++;
    if (birthDate && birthHours !== '' && birthMinutes !== '') filled++;
    if (gender !== null) filled++;
    if (firstNameGuess.trim().length > 0) filled++;
    if (whoCriesFirst !== null) filled++;
    if (hasTouchedSlider) filled++;

    return Math.round((filled / total) * 100);
  }, [userName, birthDate, birthHours, birthMinutes, gender, firstNameGuess, whoCriesFirst, hasTouchedSlider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError('');

    const trimmedName = userName.trim();
    if (!trimmedName) {
      setDuplicateError('Veuillez inscrire votre prénom et nom en haut du formulaire.');
      return;
    }
    if (!birthDate) {
      setDuplicateError('Veuillez choisir une date estimée d\'accouchement.');
      return;
    }
    if (!gender) {
      setDuplicateError('Veuillez choisir le sexe (Fille ou Garçon).');
      return;
    }
    if (!whoCriesFirst) {
      setDuplicateError('Veuillez choisir qui pleurera en premier.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Vérification si cet appareil ou ce prénom a déjà soumis
      const alreadySubmittedDevice = localStorage.getItem('le_petit_oracle_submitted') === 'true';
      if (alreadySubmittedDevice) {
        const previousName = localStorage.getItem('le_petit_oracle_user_name') || 'cet appareil';
        setDuplicateError(`Un pronostic a déjà été enregistré depuis votre appareil (au nom de "${previousName}").`);
        setIsSubmitting(false);
        return;
      }

      const existsInDb = await checkIfPredictionExists(trimmedName);
      if (existsInDb) {
        setDuplicateError(`Un pronostic existe déjà au nom de "${trimmedName}". Merci de préciser votre prénom et nom !`);
        setIsSubmitting(false);
        return;
      }

      const formattedHours = birthHours.padStart(2, '0');
      const formattedMinutes = birthMinutes.padStart(2, '0');
      const isoBirthDate = new Date(`${birthDate}T${formattedHours}:${formattedMinutes}:00`).toISOString();

      await onSubmit({
        user_name: trimmedName,
        gender,
        birth_date: isoBirthDate,
        first_name_guess: firstNameGuess.trim(),
        who_cries_first: whoCriesFirst,
        weight_grams: weightGrams,
        height_cm: heightCm,
      });

      // Mémoriser la soumission sur cet appareil
      localStorage.setItem('le_petit_oracle_submitted', 'true');
      localStorage.setItem('le_petit_oracle_user_name', trimmedName);

    } catch (err) {
      console.error(err);
      setDuplicateError('Une erreur est survenue lors de l\'enregistrement. Réessayez.');
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

        {/* User Identity Box */}
        <div className="flex flex-col gap-1 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-xs w-full sm:w-auto">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
            Votre Prénom & Nom <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs shrink-0">
              ✍️
            </div>
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setDuplicateError('');
              }}
              className="text-sm font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 w-full sm:w-48 placeholder:text-slate-400 placeholder:font-normal"
              placeholder="ex: Mamie Chantal"
              required
            />
          </div>
        </div>
      </div>

      {/* Duplicate Error Banner */}
      {duplicateError && (
        <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{duplicateError}</span>
        </div>
      )}

      {/* Progress Step Bar */}
      <StepProgress percent={progressPercent} />

      {/* Main Grid Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT & CENTER MAIN CONTENT (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* --- ROW 1: Date/Heure (gauche) | Sexe & Prénom superposés (droite) --- */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

            {/* Card 1: La Date et l'Heure */}
            <div className="md:col-span-6 bg-[#C9DCE5]/60 border border-[#B0CAD6] p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-sm transition">
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
                  <p className="text-[11px] text-[#2D586C] font-semibold italic mt-1.5 flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-lg border border-[#A7C8D8]/50">
                    <span>🎂</span> Sortie du four prévue le 21 septembre
                  </p>
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

            {/* Colonne droite : Le Sexe & Le Prénom superposés */}
            <div className="md:col-span-6 flex flex-col justify-between gap-4">
              
              {/* Card 2: Le Sexe */}
              <div className="bg-[#F2EDE2]/80 border border-[#E3DAC8] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-sm transition flex-1">
                <span className="font-bold text-slate-800 text-sm sm:text-base mb-2 block">
                  Le Sexe
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('fille')}
                    className={`p-2.5 rounded-2xl border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      gender === 'fille'
                        ? 'bg-[#F2E5CE] border-amber-400 ring-2 ring-amber-300 shadow-sm text-slate-900 font-bold transform -translate-y-0.5'
                        : 'bg-white/80 border-stone-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <span className="text-xl">🍳</span>
                    <span className="text-xs font-bold">Fille</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender('garcon')}
                    className={`p-2.5 rounded-2xl border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      gender === 'garcon'
                        ? 'bg-[#F2E5CE] border-amber-400 ring-2 ring-amber-300 shadow-sm text-slate-900 font-bold transform -translate-y-0.5'
                        : 'bg-white/80 border-stone-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <span className="text-xl">⛵</span>
                    <span className="text-xs font-bold">Garçon</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Le Prénom */}
              <div className="bg-[#E3EFE9]/70 border border-[#C5DED2] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-sm transition flex-1">
                <span className="font-bold text-slate-800 text-sm sm:text-base mb-2 block">
                  Le Prénom
                </span>

                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Votre idée..."
                      value={firstNameGuess}
                      onChange={(e) => setFirstNameGuess(e.target.value)}
                      className="w-full bg-white/90 border border-[#A8CDC0] rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs pr-8"
                    />
                    <span className="absolute right-2.5 top-2.5 text-stone-400 text-xs">✏️</span>
                  </div>
                  <p className="text-[11px] text-teal-800/80 italic font-medium leading-tight">
                    Secret gardé jusqu'à la naissance !
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* --- ROW 2: Qui pleurera en premier ? --- */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <span>😭</span> Qui pleurera en premier ?
            </h3>

            {/* 3 Interactive Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'maman', label: 'La Maman', icon: '🤱' },
                { id: 'papa', label: 'Le Papa', icon: '🧔' },
                { id: 'les_deux', label: 'Les parents en même temps', icon: '😭' }
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
                    onChange={(e) => {
                      setWeightGrams(Number(e.target.value));
                      setHasTouchedSlider(true);
                    }}
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
                onChange={(e) => {
                  setWeightGrams(Number(e.target.value));
                  setHasTouchedSlider(true);
                }}
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
                    onChange={(e) => {
                      setHeightCm(Number(e.target.value));
                      setHasTouchedSlider(true);
                    }}
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
                onChange={(e) => {
                  setHeightCm(Number(e.target.value));
                  setHasTouchedSlider(true);
                }}
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
