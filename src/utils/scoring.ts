import { Prediction, ActualBirthData, ScoreBreakdown, RankedPrediction } from '../types/prediction';

const ORACLE_PREFIXES = [
  'Oracle',
  'Visionnaire',
  'Astrologue',
  'Médium',
  'Devin',
  'Sage',
  'Astronome',
  'Prophète',
  'Guide',
  'Augure',
  'Interprète',
  'Clairvoyant',
  'Initié',
  'Érudit',
];

/**
 * Capitalise la première lettre du nom d'un participant
 */
export function capitalizeName(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Calcule un préfixe fixe et déterministe basé sur le nom du participant
 */
export function getPrefixForName(str: string): string {
  if (!str) return 'Oracle';
  const trimmed = str.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) & 0x7fffffff;
  }
  return ORACLE_PREFIXES[hash % ORACLE_PREFIXES.length];
}

/**
 * Retourne le prénom avec son préfixe (ex: "Astrologue Mamie Chantal")
 */
export function formatOracleName(str: string): string {
  if (!str) return '';
  const prefix = getPrefixForName(str);
  const formattedName = capitalizeName(str);
  return `${prefix} ${formattedName}`;
}

/**
 * Calcul du score potentiel pour la barre latérale du formulaire
 */
export function calculatePotentialScore(
  gender: string,
  firstNameGuess: string,
  birthDate: string,
  birthHours: string,
  birthMinutes: string,
  whoCriesFirst: string,
  weightGrams: number,
  heightCm: number
): ScoreBreakdown {
  const isGenderSet = !!gender;
  const isFirstNameSet = firstNameGuess.trim().length > 0;
  const isDateTimeSet = !!birthDate && birthHours !== '' && birthMinutes !== '';
  const isCriesSet = !!whoCriesFirst;
  const isWeightSet = weightGrams > 0;
  const isHeightSet = heightCm > 0;

  const genderPts = isGenderSet ? 50 : 0;
  const firstNamePts = isFirstNameSet ? 90 : 0;
  const dateTimePts = isDateTimeSet ? 50 : 0;
  const criesPts = isCriesSet ? 30 : 0;
  const weightPts = isWeightSet ? 40 : 0;
  const heightPts = isHeightSet ? 40 : 0;

  const totalPossible = genderPts + firstNamePts + dateTimePts + criesPts + weightPts + heightPts;

  return {
    genderPts,
    firstNamePts,
    dateTimePts,
    criesPts,
    weightPts,
    heightPts,
    totalPossible,
  };
}

/**
 * Calcul du score réel final selon le barème officiel :
 * 1. Sexe exact : +50 pts
 * 2. Prénom exact : +90 pts (case-insensitive)
 * 3. Date & Heure : Max 50 pts (-2 pts par heure d'écart)
 * 4. Qui pleure en premier : +30 pts
 * 5. Poids : Max 40 pts (-1 pt tous les 20g d'écart)
 * 6. Taille : Max 40 pts (-4 pts par cm d'écart)
 */
export function calculateFinalScore(
  pred: Prediction,
  actual: ActualBirthData
): RankedPrediction {
  let genderScore = 0;
  let firstNameScore = 0;
  let dateTimeScore = 0;
  let criesScore = 0;
  let weightScore = 0;
  let heightScore = 0;

  // 1. Sexe exact (+50 pts)
  if (pred.gender === actual.gender) {
    genderScore = 50;
  }

  // 2. Prénom exact (+90 pts, case-insensitive, trim)
  if (
    pred.first_name_guess &&
    actual.first_name &&
    pred.first_name_guess.trim().toLowerCase() === actual.first_name.trim().toLowerCase()
  ) {
    firstNameScore = 90;
  }

  // 3. Date & Heure (Max 50 pts, -2 pts / heure d'écart)
  if (pred.birth_date && actual.birth_date) {
    const predTime = new Date(pred.birth_date).getTime();
    const actualTime = new Date(actual.birth_date).getTime();
    if (!isNaN(predTime) && !isNaN(actualTime)) {
      const diffHours = Math.abs(predTime - actualTime) / (1000 * 60 * 60);
      dateTimeScore = Math.max(0, Math.round(50 - diffHours * 2));
    }
  }

  // 4. Qui pleure en premier (+30 pts)
  if (pred.who_cries_first === actual.who_cried_first) {
    criesScore = 30;
  }

  // 5. Poids (Max 40 pts, -1 pt tous les 20g d'écart)
  const weightDiffGrams = Math.abs(pred.weight_grams - actual.weight_grams);
  weightScore = Math.max(0, Math.round(40 - weightDiffGrams / 20));

  // 6. Taille (Max 40 pts, -4 pts par cm d'écart)
  const heightDiffCm = Math.abs(pred.height_cm - actual.height_cm);
  heightScore = Math.max(0, Math.round(40 - heightDiffCm * 4));

  const totalScore =
    genderScore +
    firstNameScore +
    dateTimeScore +
    criesScore +
    weightScore +
    heightScore;

  return {
    ...pred,
    genderScore,
    firstNameScore,
    dateTimeScore,
    criesScore,
    weightScore,
    heightScore,
    totalScore,
  };
}
