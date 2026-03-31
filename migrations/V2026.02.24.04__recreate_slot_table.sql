DROP TABLE IF EXISTS public.slot;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_status') THEN
    CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'BOOKED', 'CANCELLED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.slot (
  id          SERIAL PRIMARY KEY,
  staff_id    INT NOT NULL,
  start_time  TIMESTAMP NOT NULL,
  end_time    TIMESTAMP NOT NULL,
  status      slot_status NOT NULL DEFAULT 'AVAILABLE',
  deleted_at  TIMESTAMP,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_slot_staff FOREIGN KEY (staff_id) REFERENCES "user" (id)
);
