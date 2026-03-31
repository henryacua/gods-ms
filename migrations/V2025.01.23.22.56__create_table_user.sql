-- migrate:up

CREATE TYPE roles AS ENUM ('USER', 'STAFF', 'ADMIN', 'SUPER_ADMIN');

CREATE TABLE IF NOT EXISTS public.user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    photo VARCHAR(255),
    birthday DATE NOT NULL,
    store_id INT,
    terms BOOLEAN NOT NULL DEFAULT FALSE,
    notification BOOLEAN NOT NULL DEFAULT TRUE,
    roles roles[] NOT NULL DEFAULT ARRAY['USER']::roles[],
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_store
        FOREIGN KEY (store_id)
        REFERENCES store (id)
);

-- migrate:down
