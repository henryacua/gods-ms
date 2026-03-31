-- migrate:up

CREATE TABLE IF NOT EXISTS public.slot (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    slot_schedule jsonb NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES "user" (id)
);

-- migrate:down
