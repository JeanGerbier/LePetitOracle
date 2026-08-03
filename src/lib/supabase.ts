import { createClient } from '@supabase/supabase-js';
import { Prediction, ActualBirthData } from '../types/prediction';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey.trim() !== ''
);

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const INITIAL_DEMO_PREDICTIONS: Prediction[] = [
  {
    id: '1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user_name: 'Mamie Chantal',
    user_email: 'chantal@famille.fr',
    gender: 'fille',
    birth_date: '2026-08-14T06:15:00.000Z',
    first_name_guess: 'Elena',
    who_cries_first: 'maman',
    weight_grams: 3400,
    height_cm: 51,
  },
  {
    id: '2',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user_name: 'Tonton Lucas',
    user_email: 'lucas@famille.fr',
    gender: 'garcon',
    birth_date: '2026-08-18T14:30:00.000Z',
    first_name_guess: 'Léo',
    who_cries_first: 'papa',
    weight_grams: 3650,
    height_cm: 52,
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    user_name: 'Cousin Julien',
    user_email: 'julien@famille.fr',
    gender: 'fille',
    birth_date: '2026-08-15T11:00:00.000Z',
    first_name_guess: 'Sofia',
    who_cries_first: 'maman',
    weight_grams: 3200,
    height_cm: 49,
  },
];

const DEFAULT_ACTUAL_BIRTH_DATA: ActualBirthData = {
  gender: 'fille',
  birth_date: '2026-08-15T02:15:00.000Z',
  first_name: 'Elena',
  who_cried_first: 'maman',
  weight_grams: 3350,
  height_cm: 50,
  is_published: false,
};

const LOCAL_PREDICTIONS_KEY = 'le_petit_oracle_predictions';
const LOCAL_RESULTS_KEY = 'le_petit_oracle_actual_birth_results';

/**
 * Récupérer la liste des pronostics depuis petitoracle_predictions
 */
export async function fetchPredictions(): Promise<Prediction[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('petitoracle_predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Prediction[];
      }
    } catch (err) {
      console.warn('Erreur Supabase predictions:', err);
    }
  }

  // Fallback LocalStorage
  const cached = localStorage.getItem(LOCAL_PREDICTIONS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignorer erreur parse
    }
  }

  localStorage.setItem(LOCAL_PREDICTIONS_KEY, JSON.stringify(INITIAL_DEMO_PREDICTIONS));
  return INITIAL_DEMO_PREDICTIONS;
}

/**
 * Vérifier si un pronostic existe déjà avec ce nom (antidoublon)
 */
export async function checkIfPredictionExists(userName: string): Promise<boolean> {
  const nameTrimmed = userName.trim().toLowerCase();
  if (!nameTrimmed) return false;

  if (supabase && isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('petitoracle_predictions')
        .select('user_name');
      if (data) {
        return data.some(p => p.user_name.trim().toLowerCase() === nameTrimmed);
      }
    } catch (err) {
      console.warn('Erreur verification doublon Supabase:', err);
    }
  }

  // Fallback LocalStorage
  const cached = localStorage.getItem(LOCAL_PREDICTIONS_KEY);
  if (cached) {
    try {
      const list: Prediction[] = JSON.parse(cached);
      return list.some(p => p.user_name.trim().toLowerCase() === nameTrimmed);
    } catch {
      // Ignorer
    }
  }

  return false;
}

/**
 * Ajouter un nouveau pronostic dans petitoracle_predictions
 */
export async function savePrediction(
  newPrediction: Omit<Prediction, 'id' | 'created_at'>
): Promise<Prediction> {
  const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  const createdAt = new Date().toISOString();

  const record: Prediction = {
    ...newPrediction,
    id: generatedId,
    created_at: createdAt,
  };

  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('petitoracle_predictions')
        .insert([newPrediction])
        .select()
        .single();

      if (!error && data) {
        return data as Prediction;
      }
    } catch (err) {
      console.warn('Erreur de sauvegarde Supabase:', err);
    }
  }

  // Fallback local
  const currentList = await fetchPredictions();
  const updatedList = [record, ...currentList];
  localStorage.setItem(LOCAL_PREDICTIONS_KEY, JSON.stringify(updatedList));

  return record;
}

/**
 * Récupérer les résultats officiels de la naissance depuis petitoracle_birth_results
 */
export async function fetchBirthResults(): Promise<ActualBirthData> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('petitoracle_birth_results')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        return {
          gender: data.gender,
          birth_date: data.birth_date,
          first_name: data.first_name,
          who_cried_first: data.who_cried_first,
          weight_grams: data.weight_grams,
          height_cm: data.height_cm,
          is_published: Boolean(data.is_published),
        };
      }
    } catch (err) {
      console.warn('Erreur Supabase birth_results:', err);
    }
  }

  // Fallback local
  const cached = localStorage.getItem(LOCAL_RESULTS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignorer
    }
  }

  return DEFAULT_ACTUAL_BIRTH_DATA;
}

/**
 * Sauvegarder les résultats officiels de la naissance dans petitoracle_birth_results
 */
export async function saveBirthResults(results: ActualBirthData): Promise<ActualBirthData> {
  const dataToSave = { ...results, is_published: true };

  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('petitoracle_birth_results')
        .upsert({
          id: 1,
          updated_at: new Date().toISOString(),
          first_name: dataToSave.first_name,
          gender: dataToSave.gender,
          who_cried_first: dataToSave.who_cried_first,
          birth_date: dataToSave.birth_date,
          weight_grams: dataToSave.weight_grams,
          height_cm: dataToSave.height_cm,
          is_published: true,
        })
        .select()
        .single();

      if (!error && data) {
        return dataToSave;
      }
    } catch (err) {
      console.warn('Erreur sauvegarde Supabase birth_results:', err);
    }
  }

  localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(dataToSave));
  return dataToSave;
}
