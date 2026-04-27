# `infra/secrets/` — runtime secrets

Files in this directory are mounted into containers as Docker Compose secrets at `/run/secrets/<name>`. **Nothing here is committed to git** (the entire directory is gitignored except this README and `.gitkeep`).

## Files Compose expects

| File                            | What it is                                   | How to populate                                                                                                  |
| ------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `duckdns_token.txt`             | DuckDNS API token for DNS-01 cert renewal    | Get from https://www.duckdns.org → "token" field → paste into the file                                           |
| `openai_api_key.txt`            | OpenAI API key (generation + moderation)     | Generate in https://platform.openai.com/api-keys → paste                                                         |
| `session_hash_salt.txt`         | Server-side salt for the anonymous session ID | `openssl rand -hex 32 > infra/secrets/session_hash_salt.txt`                                                     |
| `postgres_password.txt`         | Password for the Postgres superuser          | `openssl rand -base64 32 \| tr -d '\\n=' > infra/secrets/postgres_password.txt`                                  |
| `postgres_app_password.txt`     | Password for the non-superuser `app` role    | `openssl rand -base64 32 \| tr -d '\\n=' > infra/secrets/postgres_app_password.txt`                              |

Also export the matching env var in your shell or `.env` file before running `docker compose up`:

```sh
export POSTGRES_APP_PASSWORD="$(cat infra/secrets/postgres_app_password.txt)"
```

(Compose reads `POSTGRES_APP_PASSWORD` to build the connection string Next.js uses.)

## Rotation

To rotate any secret, overwrite the file and `docker compose up -d <service>`. The Next.js image does NOT need to be rebuilt — secrets are read at runtime from the mounted file paths.

## Backup

Back the secrets up to a password manager (1Password / Bitwarden vault item) — losing them means losing access to the database (worst case: restore from `pg_dump` with new credentials).
