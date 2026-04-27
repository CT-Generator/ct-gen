-- Conspiracy Generator v2 — Postgres init script.
-- Runs once when the volume is empty. Drizzle migrations handle subsequent schema evolution.
-- Spec: openspec/changes/v2-rebuild/specs/data-platform/spec.md

\set ON_ERROR_STOP on

-- Read the app role password from the file the entrypoint mounted.
\set app_password `cat /run/secrets/postgres_app_password`

-- Create the application database and a non-superuser role.
CREATE DATABASE cgen;

-- The :'app_password' bind protects against quoting issues; psql escapes it.
CREATE ROLE app WITH LOGIN PASSWORD :'app_password';

-- Ownership transfer + CREATE on the database so the app can run Drizzle
-- migrations (which create the `drizzle` schema for migration metadata).
ALTER DATABASE cgen OWNER TO app;
GRANT ALL ON DATABASE cgen TO app;

\connect cgen

-- App role owns everything inside the cgen database.
ALTER SCHEMA public OWNER TO app;
GRANT ALL ON SCHEMA public TO app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app;
