-- ============================================
-- TABLES À INSÉRER DANS SUPABASE
-- Exécutez ces requêtes dans l'ordre dans
-- Supabase > SQL Editor > New Query
-- ============================================

-- ============================================
-- ÉTAPE 1: Créer la table PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    initials VARCHAR(2) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes (si elles existent)
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

-- Policies (accès public)
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (true);

-- ============================================
-- ÉTAPE 2: Insérer les 4 profils utilisateurs
-- ============================================

INSERT INTO public.profiles (name, initials, color)
VALUES
    ('Eva', 'EV', '#EC4899'),
    ('Niel', 'NI', '#3B82F6'),
    ('Clémentine', 'CL', '#F59E0B'),
    ('Grégory', 'GR', '#22C55E');

-- ============================================
-- ÉTAPE 3: Modifier la table POINTS existante
-- (ajouter les colonnes manquantes)
-- ============================================

ALTER TABLE public.points
    ADD COLUMN IF NOT EXISTS name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_points_profile_id ON public.points(profile_id);

-- ============================================
-- ÉTAPE 4: Activer le Realtime sur la table POINTS
-- ============================================

-- Activer la réplication pour le temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.points;

-- ============================================
-- VÉRIFICATION: Afficher les profils créés
-- ============================================

SELECT * FROM public.profiles;

-- ============================================
-- OPTIONNEL: Assigner les points existants à Clémentine
-- (décommentez si vous avez des points sans profile_id)
-- ============================================

-- UPDATE public.points
-- SET profile_id = (SELECT id FROM public.profiles WHERE name = 'Clémentine' LIMIT 1)
-- WHERE profile_id IS NULL;
