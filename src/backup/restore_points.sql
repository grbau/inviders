-- Script de restauration pour Supabase
-- À exécuter dans le SQL Editor de Supabase (https://supabase.com/dashboard)

-- 1. Créer la table points si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.points (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT points_status_check CHECK ((status = ANY (ARRAY['selected'::text, 'to_select'::text])))
);

-- 2. Activer Row Level Security (RLS) - optionnel mais recommandé
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Enable read access for all users" ON public.points;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.points;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.points;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.points;

-- 4. Créer une politique pour permettre la lecture publique
CREATE POLICY "Enable read access for all users" ON public.points
    FOR SELECT USING (true);

-- 5. Créer une politique pour permettre l'insertion publique
CREATE POLICY "Enable insert access for all users" ON public.points
    FOR INSERT WITH CHECK (true);

-- 6. Créer une politique pour permettre la mise à jour publique
CREATE POLICY "Enable update access for all users" ON public.points
    FOR UPDATE USING (true);

-- 7. Créer une politique pour permettre la suppression publique
CREATE POLICY "Enable delete access for all users" ON public.points
    FOR DELETE USING (true);

-- 8. Insérer les données de votre backup
INSERT INTO public.points (id, name, latitude, longitude, status, created_at)
VALUES
    ('14a8f9f8-6b5d-4d85-ad5b-05369fb768b9', 'home', 48.832587036756465, 2.3220665077834726, 'selected', '2025-06-23 13:57:30.078052+00'),
    ('a3544c22-0925-4a75-bae2-49f268dccc55', 'test', 48.482918648463574, 2.3490895384480894, 'to_select', '2025-06-23 14:14:32.47744+00')
ON CONFLICT (id) DO NOTHING;

-- 9. Vérifier que les données ont été insérées
SELECT * FROM public.points;
