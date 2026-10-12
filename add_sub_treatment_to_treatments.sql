-- ============================================================================
-- DentPro OS — Add Sub-Treatment Support to Treatments Schema
-- ============================================================================
-- Safe, non-destructive, idempotent migration to support sub-treatment logging.
-- Preserves all existing treatment rows, historical records, and foreign keys.

DO $$ 
BEGIN
  -- 1. Add category column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'treatments' 
      AND column_name = 'category'
  ) THEN
    ALTER TABLE public.treatments ADD COLUMN category text;
    RAISE NOTICE 'Added column "category" to public.treatments';
  END IF;

  -- 2. Add sub_treatment column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'treatments' 
      AND column_name = 'sub_treatment'
  ) THEN
    ALTER TABLE public.treatments ADD COLUMN sub_treatment text;
    RAISE NOTICE 'Added column "sub_treatment" to public.treatments';
  END IF;
END $$;

-- 3. Create helpful indexes if they do not exist
CREATE INDEX IF NOT EXISTS idx_treatments_category ON public.treatments (category);
CREATE INDEX IF NOT EXISTS idx_treatments_sub_treatment ON public.treatments (sub_treatment);

-- 4. Backfill category and sub_treatment for compound names formatted like "Category — SubTreatment"
UPDATE public.treatments
SET 
  category = split_part(name, ' — ', 1),
  sub_treatment = split_part(name, ' — ', 2)
WHERE category IS NULL 
  AND name LIKE '% — %';

-- 5. Backfill category for single-procedure names (e.g., "Root Canal", "Scaling", "Extraction", etc.)
UPDATE public.treatments
SET category = name
WHERE category IS NULL;
