import React, { useState, useMemo } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { Prediction, WhoCriesFirst, Gender } from '../types/prediction';
import { calculatePotentialScore } from '../utils/scoring';
import { checkIfPredictionExists } from '../lib/supabase';
import { StepProgress } from './StepProgress';

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
      const [year, month, day] = birthDate.split('-').map(Number);
      const isoBirthDate = new Date(year, month - 1, day, Number(formattedHours), Number(formattedMinutes)).toISOString();

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

      {/* Main Grid Layout - Proposition A (Pleine Largeur 12 colonnes) */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
        
        {/* --- ROW 1: Date/Heure (6 cols) | Le Sexe (3 cols) | Le Prénom (3 cols) --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">

          {/* Card 1: La Date et l'Heure (6 cols) */}
          <div className="md:col-span-6 bg-[#D7E7EE]/80 border border-[#B0CAD6] rounded-3xl shadow-xs overflow-hidden flex flex-col sm:flex-row hover:shadow-sm transition">
            {/* Encart coloré gauche - Largeur fixe identique sm:w-36 */}
            <div className="sm:w-36 bg-[#A7CAD8] p-4 sm:p-5 flex flex-col items-center justify-center text-center text-[#1C3A47] shrink-0">
              <img src="/assets/date.png" alt="L'Arrivée" className="w-12 h-12 object-contain drop-shadow-xs mb-1" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#1C3A47]/90 mt-1">
                L'Arrivée
              </span>
            </div>

            {/* Formulaire droite */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
              <span className="font-bold text-slate-800 text-base block mb-1">
                La Date et l'Heure
              </span>

              <div className="flex-1 flex flex-col justify-center space-y-1.5">
                <div className="grid grid-cols-12 gap-2 items-end">
                  {/* Date estimée (6 cols) */}
                  <div className="col-span-6">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Date estimée</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full h-[34px] bg-white/90 border border-[#A7C8D8] rounded-xl px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs"
                      required
                    />
                  </div>

                  {/* Heure (3 cols) */}
                  <div className="col-span-3">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Heure</label>
                    <div className="flex items-center h-[34px] bg-white/90 border border-[#A7C8D8] rounded-xl px-1.5 shadow-xs">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={birthHours}
                        onChange={(e) => setBirthHours(e.target.value)}
                        className="w-full text-center bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                      />
                      <div className="flex flex-col text-[9px] text-slate-500 border-l border-stone-200 pl-0.5">
                        <button type="button" onClick={handleIncrementHour} className="hover:text-teal-700 font-bold">▲</button>
                        <button type="button" onClick={handleDecrementHour} className="hover:text-[#2D586C] font-bold">▼</button>
                      </div>
                    </div>
                  </div>

                  {/* Minute (3 cols) */}
                  <div className="col-span-3">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Minute</label>
                    <div className="flex items-center h-[34px] bg-white/90 border border-[#A7C8D8] rounded-xl px-1.5 shadow-xs">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={birthMinutes}
                        onChange={(e) => setBirthMinutes(e.target.value)}
                        className="w-full text-center bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                      />
                      <div className="flex flex-col text-[9px] text-slate-500 border-l border-stone-200 pl-0.5">
                        <button type="button" onClick={handleIncrementMinute} className="hover:text-teal-700 font-bold">▲</button>
                        <button type="button" onClick={handleDecrementMinute} className="hover:text-teal-700 font-bold">▼</button>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-[#2D586C] font-semibold italic">
                  Sortie du four prévue : 21 septembre
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Le Sexe (3 cols) */}
          <div className="md:col-span-3 bg-[#FAF5EC] border border-[#EADFCF] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-sm transition">
            <span className="font-bold text-slate-800 text-base mb-2 block">
              Le Sexe
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGender('fille')}
                className={`aspect-square p-2.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  gender === 'fille'
                    ? 'bg-[#F5E8D2] border-amber-400 ring-2 ring-amber-300 shadow-sm text-slate-900 font-bold transform -translate-y-0.5'
                    : 'bg-white/80 border-[#E5DACE] hover:bg-white text-slate-600'
                }`}
              >
                <img src="/assets/fille.png" alt="Fille" className="w-8 h-8 object-contain" />
                <span className="text-xs font-bold">Fille</span>
              </button>

              <button
                type="button"
                onClick={() => setGender('garcon')}
                className={`aspect-square p-2.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  gender === 'garcon'
                    ? 'bg-[#F5E8D2] border-amber-400 ring-2 ring-amber-300 shadow-sm text-slate-900 font-bold transform -translate-y-0.5'
                    : 'bg-white/80 border-[#E5DACE] hover:bg-white text-slate-600'
                }`}
              >
                <img src="/assets/garcon.png" alt="Garçon" className="w-8 h-8 object-contain" />
                <span className="text-xs font-bold">Garçon</span>
              </button>
            </div>
          </div>

          {/* Card 3: Le Prénom (3 cols) */}
          <div className="md:col-span-3 bg-[#E8F3F0] border border-[#D0E5E0] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col hover:shadow-sm transition">
            <span className="font-bold text-slate-800 text-base mb-1 block">
              Le Prénom
            </span>

            <div className="flex-1 flex flex-col justify-center space-y-2">
              <input
                type="text"
                placeholder="Votre idée..."
                value={firstNameGuess}
                onChange={(e) => setFirstNameGuess(e.target.value)}
                className="w-full bg-white/90 border border-[#A8CDC0] rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs"
              />
              <p className="text-[11px] text-teal-800/80 italic font-medium leading-tight">
                Secret gardé jusqu'à la naissance !
              </p>
            </div>
          </div>

        </div>

        {/* --- ROW 2: Qui pleurera en premier ? (12 cols) --- */}
        <div className="bg-[#EEF7F5]/80 border border-[#CDE5E0] rounded-3xl shadow-xs overflow-hidden flex flex-col sm:flex-row hover:shadow-sm transition">
          {/* Encart coloré gauche - Largeur fixe identique sm:w-36 */}
          <div className="sm:w-36 bg-[#79ADA5] p-5 flex flex-col items-center justify-center text-center text-white shrink-0">
            <img src="/assets/bebe.png" alt="Bébé" className="w-14 h-14 object-contain drop-shadow-xs" />
          </div>

          {/* Zone de formulaire droite */}
          <div className="flex-1 p-5 sm:p-6 space-y-3">
            <h3 className="font-bold text-slate-800 text-base">
              Qui pleurera en premier ?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'maman', label: 'La Maman', icon: '/assets/maman.png' },
                { id: 'papa', label: 'Le Papa', icon: '/assets/papa.png' },
                { id: 'les_deux', label: 'Les deux', icon: '/assets/papa-maman.png' }
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setWhoCriesFirst(option.id as WhoCriesFirst)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center h-28 cursor-pointer ${
                    whoCriesFirst === option.id
                      ? 'bg-[#FDF7EA] border-amber-400 ring-2 ring-amber-300 shadow-md transform -translate-y-0.5'
                      : 'bg-white/80 border-stone-200 hover:bg-white text-slate-700'
                  }`}
                >
                  <img src={option.icon} alt={option.label} className="w-10 h-10 object-contain drop-shadow-2xs" />
                  <span className="text-xs font-bold text-slate-800">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- ROW 3: Poids (g) & Taille (cm) séparés en 2 cartes (6 cols + 6 cols) --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Card 5: Poids (g) (6 cols) */}
          <div className="md:col-span-6 bg-[#FAF0EF] border border-[#F2D7D4] rounded-3xl shadow-xs overflow-hidden flex flex-col sm:flex-row hover:shadow-sm transition">
            <div className="sm:w-36 bg-[#E2A9A3] p-5 flex flex-col items-center justify-center text-center text-white shrink-0">
              <img src="/assets/poids.png" alt="Poids" className="w-12 h-12 object-contain drop-shadow-xs" />
            </div>

            <div className="flex-1 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 text-base">
                  Poids (g)
                </label>
                <div className="flex items-center gap-1.5 bg-white/90 border border-[#F2D7D4] px-3 py-1 rounded-xl shadow-xs">
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
                className="w-full accent-rose-500 cursor-pointer h-2 bg-rose-200/60 rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-medium text-stone-400">
                <span>2200g</span>
                <span className="text-rose-800 font-semibold">3500g (Moyenne)</span>
                <span>4800g</span>
              </div>
            </div>
          </div>

          {/* Card 6: Taille (cm) (6 cols) */}
          <div className="md:col-span-6 bg-[#EBF4F6] border border-[#CBDDE2] rounded-3xl shadow-xs overflow-hidden flex flex-col sm:flex-row hover:shadow-sm transition">
            <div className="sm:w-36 bg-[#82AFA5] p-5 flex flex-col items-center justify-center text-center text-white shrink-0">
              <img src="/assets/taille.png" alt="Taille" className="w-12 h-12 object-contain drop-shadow-xs" />
            </div>

            <div className="flex-1 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 text-base">
                  Taille (cm)
                </label>
                <div className="flex items-center gap-1.5 bg-white/90 border border-[#CBDDE2] px-3 py-1 rounded-xl shadow-xs">
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
                className="w-full accent-teal-600 cursor-pointer h-2 bg-teal-200/60 rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-medium text-stone-400">
                <span>42 cm</span>
                <span className="text-teal-800 font-semibold">50 cm (Moyenne)</span>
                <span>58 cm</span>
              </div>
            </div>
          </div>

        </div>

        {/* --- BANDEAU BAS DE PAGE : RECAP SCORE & BOUTON D'ENVOI --- */}
        <div className="bg-white/95 backdrop-blur-md border-2 border-teal-600/30 rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div className="flex items-center gap-4 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-[#E3EFE9] border border-[#BDE0D0] flex items-center justify-center text-xl shrink-0 shadow-xs">
              🏆
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Score Potentiel Estimé</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">+{scoreBreakdown.totalPossible} pts</span>
                <span className="text-xs text-slate-400 font-medium">/ 230 pts max</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#528F79] hover:bg-[#437A66] text-white font-bold py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-base cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <span>Soumettre mon Pronostic</span>
            <Send className="w-5 h-5" />
          </button>
        </div>

      </form>
    </div>
  );
};
