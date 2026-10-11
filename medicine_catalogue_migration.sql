-- ============================================================================
-- DENTPRO OS: MEDICINE CATALOGUE & CATEGORY MIGRATION SCRIPT
-- Migration: Add Category & Dosage Form, Seed 35 Canonical Catalogue Entries,
-- and Deprecate Legacy 11 Mock Items.
-- ============================================================================

-- 1. ADD MISSING COLUMNS TO MEDICINES TABLE IF NOT EXISTS
ALTER TABLE public.medicines 
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Tablets / Capsules',
    ADD COLUMN IF NOT EXISTS dosage_form TEXT DEFAULT 'tablets';

CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category);

-- 2. DEPRECATE / DEACTIVATE LEGACY 11 MOCK ENTRIES
-- We do not delete to protect historical foreign key integrity, but deactivate so they don't appear in default active catalogue
UPDATE public.medicines 
SET is_active = false 
WHERE LOWER(name) IN (
    'roles-d',
    'taxim-o 200',
    'acecloren',
    'zerodol-mr',
    'flagyl 400',
    'zerodol-sp',
    'orahex-dg',
    'sensodent-k',
    'orohealth toothpaste',
    'ornigreat gel',
    'flagyl gel'
);

-- 3. SEED THE 35 CANONICAL MEDICINE CATALOGUE ENTRIES
-- Safe upsert with ON CONFLICT (name) DO UPDATE to avoid duplicates on re-runs
INSERT INTO public.medicines (
    name,
    category,
    dosage_form,
    stock_unit,
    low_stock_threshold,
    is_active,
    is_configured,
    opening_stock,
    available_quantity
)
VALUES
    -- A. Tablets / Capsules (19 items)
    ('Rabross DSR', 'Tablets / Capsules', 'Capsule', 'capsules', 5, true, false, NULL, NULL),
    ('Moxclav 625 mg', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Metrogyl 600 mg', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Hifenac D', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Zymoflam D', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Wynox 300 mg', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Rexfix 200 mg', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Ketof-DT', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Paracetamol 650 mg', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Paracetamol 500 mg', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Paracetamol 250 mg', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Moxclav 375 mg', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Isolin Junior', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Hifenac TH', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Chymerol Forte', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Ultracet', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('Zilo', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('SM Fibro', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),
    ('DoxT-SL', 'Tablets / Capsules', 'Tablet', 'tablets', 5, true, false, NULL, NULL),

    -- B. Syrups / Suspensions (2 items)
    ('Augmentin Duo', 'Syrups / Suspensions', 'Syrup', 'bottles', 5, true, false, NULL, NULL),
    ('Flexon Suspension', 'Syrups / Suspensions', 'Suspension', 'bottles', 5, true, false, NULL, NULL),

    -- C. Ointments / Gels (4 items)
    ('Dentogel', 'Ointments / Gels', 'Gel', 'tubes', 5, true, false, NULL, NULL),
    ('Kenacort Gel', 'Ointments / Gels', 'Gel', 'tubes', 5, true, false, NULL, NULL),
    ('Gumloc', 'Ointments / Gels', 'Gel / Ointment', 'tubes', 5, true, false, NULL, NULL),
    ('Multident', 'Ointments / Gels', 'Gel / Ointment', 'tubes', 5, true, false, NULL, NULL),

    -- D. Mouthwashes (2 items)
    ('Senquel-AD', 'Mouthwashes', 'Mouthwash', 'bottles', 5, true, false, NULL, NULL),
    ('Chlorhex ADS', 'Mouthwashes', 'Mouthwash', 'bottles', 5, true, false, NULL, NULL),

    -- E. Toothpastes (3 items)
    ('Vantej', 'Toothpastes', 'Toothpaste', 'tubes', 5, true, false, NULL, NULL),
    ('Hydent Pro', 'Toothpastes', 'Toothpaste', 'tubes', 5, true, false, NULL, NULL),
    ('Stolin R', 'Toothpastes', 'Toothpaste', 'tubes', 5, true, false, NULL, NULL),

    -- F. Kids'' Products (3 items)
    ('Cheerio Gel', 'Kids'' Products', 'Gel', 'tubes', 5, true, false, NULL, NULL),
    ('Oro Champ', 'Kids'' Products', 'Syrup / Gel', 'bottles', 5, true, false, NULL, NULL),
    ('Kidodent', 'Kids'' Products', 'Toothpaste / Gel', 'tubes', 5, true, false, NULL, NULL),

    -- G. Brushes (2 items)
    ('Thermoseal Proxa NS/WS Interdental Brushes', 'Brushes', 'Interdental Brush', 'packs', 5, true, false, NULL, NULL),
    ('Colgate Slim Soft', 'Brushes', 'Toothbrush', 'pieces', 5, true, false, NULL, NULL)
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    dosage_form = EXCLUDED.dosage_form,
    stock_unit = EXCLUDED.stock_unit,
    is_active = true;

-- Verification query
-- SELECT category, COUNT(*) FROM public.medicines WHERE is_active = true GROUP BY category ORDER BY category;
