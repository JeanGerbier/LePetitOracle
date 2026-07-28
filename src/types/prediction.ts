export type Gender = 'fille' | 'garcon';

export type WhoCriesFirst = 'maman' | 'papa' | 'les_deux';

export interface Prediction {
  id: string;
  created_at: string;
  user_name: string;
  user_email?: string;
  gender: Gender;
  birth_date: string; // ISO string date + time, e.g. "2026-08-15T02:15:00.000Z"
  first_name_guess: string;
  who_cries_first: WhoCriesFirst;
  weight_grams: number;
  height_cm: number;
}

export interface ActualBirthData {
  gender: Gender;
  birth_date: string; // ISO string
  first_name: string;
  who_cried_first: WhoCriesFirst;
  weight_grams: number;
  height_cm: number;
}

export interface ScoreBreakdown {
  genderPts: number;
  firstNamePts: number;
  dateTimePts: number;
  criesPts: number;
  weightPts: number;
  heightPts: number;
  totalPossible: number;
}

export interface RankedPrediction extends Prediction {
  totalScore: number;
  genderScore: number;
  firstNameScore: number;
  dateTimeScore: number;
  criesScore: number;
  weightScore: number;
  heightScore: number;
}
