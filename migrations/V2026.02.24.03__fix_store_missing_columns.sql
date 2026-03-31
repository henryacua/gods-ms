-- Migration to add missing columns to store table idempotently
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store' AND column_name='phone') THEN
        ALTER TABLE public.store ADD COLUMN phone VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store' AND column_name='country') THEN
        ALTER TABLE public.store ADD COLUMN country VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store' AND column_name='organization_id') THEN
        ALTER TABLE public.store ADD COLUMN organization_id INT;
    END IF;

    -- Add constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_organization' AND table_name='store') THEN
        ALTER TABLE public.store
          ADD CONSTRAINT fk_organization
          FOREIGN KEY (organization_id) REFERENCES organization (id);
    END IF;
END $$;
