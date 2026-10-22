-- ============================================================================
-- DENTPRO OS: TREATMENT CATALOGUE MIGRATION SCRIPT
-- Migration: Add persistent treatment_categories table with sub-treatments,
-- colors, stable IDs, and Owner/Dentist RLS security.
-- ============================================================================

-- 1. CREATE TREATMENT_CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.treatment_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    color_key TEXT NOT NULL,
    color_dot TEXT,
    color_badge TEXT,
    color_tooth TEXT,
    sub_treatments JSONB DEFAULT '[]'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE HELPFUL INDEXES
CREATE INDEX IF NOT EXISTS idx_treatment_categories_name ON public.treatment_categories(name);
CREATE INDEX IF NOT EXISTS idx_treatment_categories_active ON public.treatment_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_treatment_categories_sort_order ON public.treatment_categories(sort_order);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.treatment_categories ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- A. All authenticated users (owner, doctors, staff, receptionists) can view the treatment catalogue
DROP POLICY IF EXISTS "Authenticated users can view treatment categories" ON public.treatment_categories;
CREATE POLICY "Authenticated users can view treatment categories"
    ON public.treatment_categories
    FOR SELECT
    TO authenticated
    USING (true);

-- B. Only authorized Owner / Dentist role can INSERT, UPDATE, DELETE treatment categories
DROP POLICY IF EXISTS "Owners can manage treatment categories" ON public.treatment_categories;
CREATE POLICY "Owners can manage treatment categories"
    ON public.treatment_categories
    FOR ALL
    TO authenticated
    USING (
        public.get_user_role() = 'owner'
    )
    WITH CHECK (
        public.get_user_role() = 'owner'
    );

-- 5. SEED INITIAL 10 CANONICAL TREATMENT CATEGORIES WITH SUB-TREATMENTS
-- Uses ON CONFLICT (id) DO NOTHING so existing modifications are preserved if re-run.
INSERT INTO public.treatment_categories (
    id,
    name,
    display_name,
    color_key,
    color_dot,
    color_badge,
    color_tooth,
    sub_treatments,
    aliases,
    sort_order,
    is_active
)
VALUES
    (
        'extractions',
        'Extractions',
        'Extractions',
        'Extraction',
        'bg-orange-500 border-orange-600',
        'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300',
        'fill-orange-200/90 dark:fill-orange-900/60 stroke-orange-600 stroke-[1.5]',
        '["Simple extraction", "Surgical extraction"]'::jsonb,
        '["Extraction"]'::jsonb,
        1,
        true
    ),
    (
        'crowns',
        'Crowns',
        'Crowns',
        'Crown',
        'bg-rose-500 border-rose-600',
        'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
        'fill-rose-200/90 dark:fill-rose-900/60 stroke-rose-600 stroke-[1.5]',
        '["Temporary crown", "PFM (Porcelain Fused to Metal)", "MLS 5Y", "MLS 10Y", "E-max", "Zirconium / Zirconia", "Crown recementation"]'::jsonb,
        '["Crown"]'::jsonb,
        2,
        true
    ),
    (
        'scaling',
        'Scaling',
        'Scaling',
        'Scaling',
        'bg-emerald-500 border-emerald-600',
        'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-955/40 dark:border-emerald-800 dark:text-emerald-300',
        'fill-emerald-200/90 dark:fill-emerald-900/60 stroke-emerald-600 stroke-[1.5]',
        '["Scaling — 1 sitting", "Scaling — 2 sittings"]'::jsonb,
        '[]'::jsonb,
        3,
        true
    ),
    (
        'orthodontics',
        'Orthodontic Treatments',
        'Orthodontic Treatments',
        'Braces',
        'bg-fuchsia-500 border-fuchsia-600',
        'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:border-fuchsia-800 dark:text-fuchsia-300',
        'fill-fuchsia-200/90 dark:fill-fuchsia-900/60 stroke-fuchsia-600 stroke-[1.5]',
        '["Metal braces", "Ceramic braces", "Self-ligating braces", "Aligners"]'::jsonb,
        '["Braces", "Orthodontics"]'::jsonb,
        4,
        true
    ),
    (
        'prosthodontics',
        'Prosthodontic Treatments',
        'Prosthodontic Treatments',
        'Prosthodontic Treatments',
        'bg-indigo-500 border-indigo-600',
        'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
        'fill-indigo-200/90 dark:fill-indigo-900/60 stroke-indigo-600 stroke-[1.5]',
        '["RPD (Removable Partial Denture)", "CD – Metal", "BPS (Biofunctional Prosthetic System denture)", "FPD — Metal", "FPD — Ceramic"]'::jsonb,
        '["Prosthodontics"]'::jsonb,
        5,
        true
    ),
    (
        'implants',
        'Implants',
        'Implants',
        'Implant',
        'bg-cyan-500 border-cyan-600',
        'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300',
        'fill-cyan-200/90 dark:fill-cyan-900/60 stroke-cyan-600 stroke-[1.5]',
        '["Full-mouth implants", "Single-tooth implant"]'::jsonb,
        '["Implant"]'::jsonb,
        6,
        true
    ),
    (
        'pediatric',
        'Pediatric Dentistry',
        'Pediatric Dentistry',
        'Pediatric Dentistry',
        'bg-amber-500 border-amber-600',
        'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
        'fill-amber-200/90 dark:fill-amber-900/60 stroke-amber-600 stroke-[1.5]',
        '["Pulpectomy"]'::jsonb,
        '["Pediatric"]'::jsonb,
        7,
        true
    ),
    (
        'root-canal',
        'Root Canal',
        'Root Canal',
        'Root Canal',
        'bg-blue-500 border-blue-600',
        'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300',
        'fill-blue-200/90 dark:fill-blue-900/60 stroke-blue-600 stroke-[1.5]',
        '[]'::jsonb,
        '[]'::jsonb,
        8,
        true
    ),
    (
        'filling',
        'Filling',
        'Filling',
        'Filling',
        'bg-purple-500 border-purple-600',
        'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300',
        'fill-purple-200/90 dark:fill-purple-900/60 stroke-purple-600 stroke-[1.5]',
        '[]'::jsonb,
        '[]'::jsonb,
        9,
        true
    ),
    (
        'consultation',
        'Consultation',
        'Consultation',
        'Consultation',
        'bg-sky-500 border-sky-600',
        'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300',
        'fill-sky-200/90 dark:fill-sky-900/60 stroke-sky-600 stroke-[1.5]',
        '[]'::jsonb,
        '[]'::jsonb,
        10,
        true
    )
ON CONFLICT (id) DO NOTHING;
