-- ============================================================================
-- DENTPRO OS: OP NUMBER (PATIENT ID) SEQUENCE STARTING FROM 10001 MIGRATION
-- ============================================================================
-- Purpose:
--   1. Ensure the patient OP ID sequence begins at 10001 for newly registered patients.
--   2. Increment sequentially (10001, 10002, 10003, ...).
--   3. Concurrency-safe: Database sequence and atomic BEFORE INSERT trigger prevent
--      duplicate OP numbers even under simultaneous patient registrations.
--   4. Non-destructive: If public.patients already contains patient IDs >= 10001,
--      it safely continues from MAX(id) + 1 without conflicts.
--
-- How to Execute:
--   1. Open the Supabase Dashboard: https://supabase.com/dashboard/project/khkxwddrkwmmmcxbreau
--   2. Navigate to "SQL Editor" in the left sidebar.
--   3. Click "+ New query", paste the contents of this file, and click "Run".
-- ============================================================================

-- Step 1: Create or ensure the sequential patient ID sequence exists
CREATE SEQUENCE IF NOT EXISTS public.patient_id_seq START 10001;

-- Step 2: Set the sequence position safely.
-- If the highest existing numeric ID in public.patients is less than 10001 (or table is empty),
-- set the sequence to 10000 with is_called = true so that nextval('public.patient_id_seq') returns 10001.
-- If existing patients already have IDs >= 10001, set to MAX(id) so it continues safely.
SELECT setval(
    'public.patient_id_seq',
    GREATEST(
        10000,
        COALESCE(
            (
                SELECT MAX(SUBSTRING(patient_id FROM '[0-9]+')::bigint)
                FROM public.patients
                WHERE patient_id ~ '[0-9]+'
            ),
            10000
        )
    ),
    true
);

-- Step 3: Trigger function to atomically assign sequential OP numbers
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atomically assign the next sequential OP number if:
    --  a) patient_id is NULL or empty string
    --  b) patient_id uses the legacy 'DS-' prefix
    --  c) The provided patient_id already exists in public.patients (concurrency race safety)
    IF NEW.patient_id IS NULL 
       OR NEW.patient_id = '' 
       OR NEW.patient_id LIKE 'DS-%'
       OR EXISTS (SELECT 1 FROM public.patients WHERE patient_id = NEW.patient_id) THEN
        NEW.patient_id := nextval('public.patient_id_seq')::text;
    END IF;
    RETURN NEW;
END;
$$;

-- Step 4: Re-attach the trigger to public.patients table
DROP TRIGGER IF EXISTS tr_generate_patient_id ON public.patients;
CREATE TRIGGER tr_generate_patient_id
    BEFORE INSERT ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_patient_id();

-- Step 5: Set column default value for public.patients(patient_id)
ALTER TABLE public.patients 
    ALTER COLUMN patient_id SET DEFAULT nextval('public.patient_id_seq')::text;

-- Step 6: Verification Query (Inspect current sequence state)
SELECT 
    last_value AS current_sequence_val,
    is_called,
    CASE 
        WHEN is_called THEN last_value + 1 
        ELSE last_value 
    END AS next_op_number_to_be_assigned
FROM public.patient_id_seq;
