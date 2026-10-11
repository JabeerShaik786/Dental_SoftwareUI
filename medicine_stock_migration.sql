-- ============================================================================
-- DENTPRO OS: MEDICINE STOCK MANAGEMENT MIGRATION SCRIPT
-- Single-Clinic Model (No clinic_id / tenant_id)
-- ============================================================================

-- 1. MEDICINES CATALOGUE TABLE
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    stock_unit TEXT NOT NULL DEFAULT 'tablets',
    opening_stock NUMERIC NULL,
    available_quantity NUMERIC NULL,
    low_stock_threshold NUMERIC NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_configured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by name & active status
CREATE INDEX IF NOT EXISTS idx_medicines_active ON public.medicines(is_active);

-- 2. STOCK TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('opening_stock', 'received', 'dispensed', 'adjustment')),
    quantity NUMERIC NOT NULL,
    previous_quantity NUMERIC NULL,
    new_quantity NUMERIC NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference TEXT NULL,
    notes TEXT NULL,
    prescription_id TEXT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_transactions_med ON public.stock_transactions(medicine_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON public.stock_transactions(transaction_date);

-- 3. PATIENT PRESCRIPTIONS TABLE FOR DISPENSING TRACKING
CREATE TABLE IF NOT EXISTS public.patient_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NULL,
    advice TEXT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_prescriptions_patient ON public.patient_prescriptions(patient_id);

-- 4. INITIAL MANDATORY MEDICINE CATALOGUE SEEDING (Quantities UNSET)
INSERT INTO public.medicines (name, stock_unit, low_stock_threshold, is_active, is_configured, opening_stock, available_quantity)
VALUES
    ('Roles-D', 'tablets', 5, true, false, NULL, NULL),
    ('Taxim-O 200', 'tablets', 5, true, false, NULL, NULL),
    ('Acecloren', 'tablets', 5, true, false, NULL, NULL),
    ('Zerodol-MR', 'tablets', 5, true, false, NULL, NULL),
    ('Flagyl 400', 'tablets', 5, true, false, NULL, NULL),
    ('Zerodol-SP', 'tablets', 5, true, false, NULL, NULL),
    ('Orahex-DG', 'bottles', 5, true, false, NULL, NULL),
    ('Sensodent-K', 'tubes', 5, true, false, NULL, NULL),
    ('Orohealth Toothpaste', 'tubes', 5, true, false, NULL, NULL),
    ('Ornigreat Gel', 'tubes', 5, true, false, NULL, NULL),
    ('Flagyl Gel', 'tubes', 5, true, false, NULL, NULL)
ON CONFLICT (name) DO NOTHING;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_prescriptions ENABLE ROW LEVEL SECURITY;

-- Medicines RLS:
-- Owner & Receptionist can read active/all medicines for prescription selection & UI
DROP POLICY IF EXISTS "allow_read_medicines" ON public.medicines;
CREATE POLICY "allow_read_medicines" ON public.medicines
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('owner', 'receptionist'));

-- Only Owner can insert, update, or delete medicines
DROP POLICY IF EXISTS "allow_owner_write_medicines" ON public.medicines;
CREATE POLICY "allow_owner_write_medicines" ON public.medicines
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'owner')
    WITH CHECK (public.get_user_role() = 'owner');

-- Stock Transactions RLS:
DROP POLICY IF EXISTS "allow_read_stock_transactions" ON public.stock_transactions;
CREATE POLICY "allow_read_stock_transactions" ON public.stock_transactions
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "allow_owner_write_stock_transactions" ON public.stock_transactions;
CREATE POLICY "allow_owner_write_stock_transactions" ON public.stock_transactions
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'owner')
    WITH CHECK (public.get_user_role() = 'owner');

-- Patient Prescriptions RLS:
DROP POLICY IF EXISTS "allow_read_patient_prescriptions" ON public.patient_prescriptions;
CREATE POLICY "allow_read_patient_prescriptions" ON public.patient_prescriptions
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "allow_write_patient_prescriptions" ON public.patient_prescriptions;
CREATE POLICY "allow_write_patient_prescriptions" ON public.patient_prescriptions
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'owner')
    WITH CHECK (public.get_user_role() = 'owner');


-- 6. ATOMIC RPC FUNCTIONS FOR INVENTORY OPERATIONS

-- A. Set Opening Stock Function
CREATE OR REPLACE FUNCTION public.set_opening_stock(
    p_medicine_id UUID,
    p_opening_stock NUMERIC,
    p_stock_unit TEXT,
    p_low_threshold NUMERIC,
    p_is_active BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_med RECORD;
    v_old_qty NUMERIC;
    v_new_qty NUMERIC;
BEGIN
    v_role := public.get_user_role();
    IF v_role <> 'owner' THEN
        RAISE EXCEPTION 'Unauthorized: Only clinic owners can modify medicine stock.';
    END IF;

    IF p_opening_stock < 0 THEN
        RAISE EXCEPTION 'Opening stock quantity cannot be negative.';
    END IF;

    SELECT * INTO v_med FROM public.medicines WHERE id = p_medicine_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine not found.';
    END IF;

    v_old_qty := COALESCE(v_med.available_quantity, 0);
    v_new_qty := p_opening_stock;

    UPDATE public.medicines
    SET opening_stock = p_opening_stock,
        available_quantity = p_opening_stock,
        stock_unit = p_stock_unit,
        low_stock_threshold = p_low_threshold,
        is_active = p_is_active,
        is_configured = true,
        updated_at = NOW()
    WHERE id = p_medicine_id;

    INSERT INTO public.stock_transactions (
        medicine_id,
        transaction_type,
        quantity,
        previous_quantity,
        new_quantity,
        transaction_date,
        reference,
        notes,
        created_by
    ) VALUES (
        p_medicine_id,
        'opening_stock',
        p_opening_stock,
        v_old_qty,
        v_new_qty,
        NOW(),
        'INITIAL_SETUP',
        'Opening stock configured',
        auth.uid()
    );

    RETURN jsonb_build_object('success', true, 'new_quantity', v_new_qty);
END;
$$;


-- B. Add Stock Function
CREATE OR REPLACE FUNCTION public.add_medicine_stock(
    p_medicine_id UUID,
    p_quantity NUMERIC,
    p_transaction_date TIMESTAMPTZ,
    p_reference TEXT,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_med RECORD;
    v_old_qty NUMERIC;
    v_new_qty NUMERIC;
BEGIN
    v_role := public.get_user_role();
    IF v_role <> 'owner' THEN
        RAISE EXCEPTION 'Unauthorized: Only clinic owners can add medicine stock.';
    END IF;

    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity received must be greater than zero.';
    END IF;

    SELECT * INTO v_med FROM public.medicines WHERE id = p_medicine_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine not found.';
    END IF;

    v_old_qty := COALESCE(v_med.available_quantity, 0);
    v_new_qty := v_old_qty + p_quantity;

    UPDATE public.medicines
    SET available_quantity = v_new_qty,
        is_configured = true,
        updated_at = NOW()
    WHERE id = p_medicine_id;

    INSERT INTO public.stock_transactions (
        medicine_id,
        transaction_type,
        quantity,
        previous_quantity,
        new_quantity,
        transaction_date,
        reference,
        notes,
        created_by
    ) VALUES (
        p_medicine_id,
        'received',
        p_quantity,
        v_old_qty,
        v_new_qty,
        COALESCE(p_transaction_date, NOW()),
        p_reference,
        p_notes,
        auth.uid()
    );

    RETURN jsonb_build_object('success', true, 'new_quantity', v_new_qty);
END;
$$;


-- C. Stock Adjustment Function
CREATE OR REPLACE FUNCTION public.adjust_medicine_stock(
    p_medicine_id UUID,
    p_new_quantity NUMERIC,
    p_reason TEXT,
    p_transaction_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_med RECORD;
    v_old_qty NUMERIC;
    v_delta NUMERIC;
BEGIN
    v_role := public.get_user_role();
    IF v_role <> 'owner' THEN
        RAISE EXCEPTION 'Unauthorized: Only clinic owners can adjust medicine stock.';
    END IF;

    IF p_new_quantity < 0 THEN
        RAISE EXCEPTION 'Adjusted stock quantity cannot be negative.';
    END IF;

    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'Reason for adjustment is required.';
    END IF;

    SELECT * INTO v_med FROM public.medicines WHERE id = p_medicine_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine not found.';
    END IF;

    v_old_qty := COALESCE(v_med.available_quantity, 0);
    v_delta := p_new_quantity - v_old_qty;

    UPDATE public.medicines
    SET available_quantity = p_new_quantity,
        is_configured = true,
        updated_at = NOW()
    WHERE id = p_medicine_id;

    INSERT INTO public.stock_transactions (
        medicine_id,
        transaction_type,
        quantity,
        previous_quantity,
        new_quantity,
        transaction_date,
        reference,
        notes,
        created_by
    ) VALUES (
        p_medicine_id,
        'adjustment',
        v_delta,
        v_old_qty,
        p_new_quantity,
        COALESCE(p_transaction_date, NOW()),
        'ADJUSTMENT',
        p_reason,
        auth.uid()
    );

    RETURN jsonb_build_object('success', true, 'new_quantity', p_new_quantity);
END;
$$;


-- D. Atomic Dispense Prescription Item Function (Idempotent & Safe)
CREATE OR REPLACE FUNCTION public.dispense_prescription_item(
    p_prescription_id UUID,
    p_item_index INT,
    p_dispensing_qty NUMERIC DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_presc RECORD;
    v_items JSONB;
    v_item JSONB;
    v_med_id UUID;
    v_qty NUMERIC;
    v_med RECORD;
    v_old_qty NUMERIC;
    v_new_qty NUMERIC;
    v_updated_items JSONB;
BEGIN
    v_role := public.get_user_role();
    IF v_role <> 'owner' THEN
        RAISE EXCEPTION 'Unauthorized: Only clinic owners can dispense medicines.';
    END IF;

    SELECT * INTO v_presc FROM public.patient_prescriptions WHERE id = p_prescription_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Prescription not found.';
    END IF;

    v_items := v_presc.items;
    v_item := v_items -> p_item_index;

    IF v_item IS NULL THEN
        RAISE EXCEPTION 'Prescription medicine item not found at index %.', p_item_index;
    END IF;

    -- Idempotency check: Already dispensed?
    IF (v_item ->> 'dispensed')::BOOLEAN IS TRUE THEN
        RETURN jsonb_build_object('success', true, 'already_dispensed', true, 'message', 'Item was already dispensed.');
    END IF;

    IF (v_item ->> 'medicine_id') IS NULL THEN
        RAISE EXCEPTION 'Medicine ID is missing for this prescription item.';
    END IF;

    v_med_id := (v_item ->> 'medicine_id')::UUID;
    v_qty := COALESCE(p_dispensing_qty, (v_item ->> 'dispensing_quantity')::NUMERIC, 1);

    IF v_qty <= 0 THEN
        RAISE EXCEPTION 'Dispensing quantity must be greater than zero.';
    END IF;

    -- Lock Medicine row
    SELECT * INTO v_med FROM public.medicines WHERE id = v_med_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Prescribed medicine not found in inventory catalogue.';
    END IF;

    IF NOT v_med.is_active THEN
        RAISE EXCEPTION 'Medicine "%" is inactive and cannot be dispensed.', v_med.name;
    END IF;

    IF NOT v_med.is_configured OR v_med.available_quantity IS NULL THEN
        RAISE EXCEPTION 'Opening stock for "%" has not been configured.', v_med.name;
    END IF;

    IF v_med.available_quantity < v_qty THEN
        RAISE EXCEPTION 'Insufficient stock for "%". Available: % %, Requested: % %.',
            v_med.name, v_med.available_quantity, v_med.stock_unit, v_qty, v_med.stock_unit;
    END IF;

    v_old_qty := v_med.available_quantity;
    v_new_qty := v_old_qty - v_qty;

    -- Update inventory
    UPDATE public.medicines
    SET available_quantity = v_new_qty,
        updated_at = NOW()
    WHERE id = v_med_id;

    -- Record transaction
    INSERT INTO public.stock_transactions (
        medicine_id,
        transaction_type,
        quantity,
        previous_quantity,
        new_quantity,
        transaction_date,
        reference,
        notes,
        prescription_id,
        created_by
    ) VALUES (
        v_med_id,
        'dispensed',
        -v_qty,
        v_old_qty,
        v_new_qty,
        NOW(),
        'DISPENSE_' || p_prescription_id,
        'Dispensed for patient ' || v_presc.patient_name,
        p_prescription_id::TEXT,
        auth.uid()
    );

    -- Mark item as dispensed in JSONB
    v_updated_items := jsonb_set(
        v_items,
        ARRAY[p_item_index::TEXT],
        v_item || jsonb_build_object(
            'dispensed', true,
            'dispensed_at', NOW(),
            'dispensed_by', auth.uid(),
            'dispensing_quantity', v_qty
        )
    );

    UPDATE public.patient_prescriptions
    SET items = v_updated_items,
        updated_at = NOW()
    WHERE id = p_prescription_id;

    RETURN jsonb_build_object('success', true, 'new_quantity', v_new_qty, 'already_dispensed', false);
END;
$$;
