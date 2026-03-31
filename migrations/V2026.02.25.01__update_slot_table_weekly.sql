-- Drop old table
DROP TABLE IF EXISTS public.slot;

-- Ensure enums exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_status') THEN
    CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'BOOKED', 'CANCELLED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'day_of_week') THEN
    CREATE TYPE day_of_week AS ENUM (
      'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
      'FRIDAY', 'SATURDAY', 'SUNDAY'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.slot (
  id           SERIAL PRIMARY KEY,
  staff_id     INT NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  day_of_week  day_of_week NOT NULL,
  status       slot_status NOT NULL DEFAULT 'AVAILABLE',
  deleted_at   TIMESTAMP,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_slot_staff FOREIGN KEY (staff_id) REFERENCES "user" (id)
);
