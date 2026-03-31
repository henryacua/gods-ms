DROP TABLE IF EXISTS public.slot;
DROP TYPE IF EXISTS public.slot_status;

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
  deleted_at   TIMESTAMP,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_slot_staff FOREIGN KEY (staff_id) REFERENCES "user" (id) ON DELETE CASCADE
);
