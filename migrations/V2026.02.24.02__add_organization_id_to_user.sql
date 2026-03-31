ALTER TABLE public.user
  ADD COLUMN IF NOT EXISTS organization_id INT,
  ADD CONSTRAINT fk_user_organization
    FOREIGN KEY (organization_id) REFERENCES organization (id);
