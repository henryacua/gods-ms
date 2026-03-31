-- migrate:up

CREATE TYPE status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE IF NOT EXISTS public.appointment (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    schedule jsonb NOT NULL,
    status status NOT NULL DEFAULT 'PENDING',
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES "user" (id)
);

-- migrate:down
