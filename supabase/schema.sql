-- =========================================================
-- LE PETIT ORACLE - SCHÉMA DE BASE DE DONNÉES SUPABASE
-- =========================================================

-- 1. Création des types ENUM
DO $$ BEGIN
  CREATE TYPE baby_gender AS ENUM ('fille', 'garcon');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE who_cries_enum AS ENUM ('bebe', 'maman', 'papa', 'les_deux');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Table `predictions` (Pronostics des proches)
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  gender baby_gender NOT NULL DEFAULT 'fille',
  birth_date TIMESTAMPTZ NOT NULL,
  first_name_guess TEXT DEFAULT '',
  who_cries_first who_cries_enum NOT NULL DEFAULT 'bebe',
  weight_grams INTEGER NOT NULL DEFAULT 3300,
  height_cm INTEGER NOT NULL DEFAULT 50
);

-- Activation de la RLS pour `predictions`
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pronostics visibles par tous" 
  ON public.predictions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Création de pronostics autorisée pour tous" 
  ON public.predictions 
  FOR INSERT 
  WITH CHECK (true);

-- Index de tri
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions (created_at DESC);


-- 3. Table `birth_results` (Résultats réels enregistrés par les parents)
CREATE TABLE IF NOT EXISTS public.birth_results (
  id INT PRIMARY KEY DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  first_name TEXT NOT NULL,
  gender baby_gender NOT NULL DEFAULT 'fille',
  who_cried_first who_cries_enum NOT NULL DEFAULT 'bebe',
  birth_date TIMESTAMPTZ NOT NULL,
  weight_grams INTEGER NOT NULL DEFAULT 3350,
  height_cm INTEGER NOT NULL DEFAULT 50,
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Activation de la RLS pour `birth_results`
ALTER TABLE public.birth_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Résultats réels visibles par tous" 
  ON public.birth_results 
  FOR SELECT 
  USING (true);

CREATE POLICY "Résultats réels modifiables par tous" 
  ON public.birth_results 
  FOR ALL 
  USING (true);
