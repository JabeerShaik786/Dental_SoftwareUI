-- ============================================================================
-- DENTPRO OS - PATIENT MEDICAL HISTORY & PROFILE FIELDS MIGRATION
-- ============================================================================
-- Safely adds occupation, reference, medical_history, and medical_history_others
-- columns to public.patients table without modifying or dropping existing data.
-- ============================================================================

BEGIN;

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS medical_history TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS medical_history_others TEXT;

COMMIT;
