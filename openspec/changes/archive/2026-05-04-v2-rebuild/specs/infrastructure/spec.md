## ADDED Requirements

### Requirement: Hetzner VPS as production host

The production deployment SHALL run on a single Hetzner Cloud VPS (initial size: CAX11 ARM, 2 vCPU / 4 GB / 40 GB SSD). All app services SHALL be containerized and orchestrated via Docker Compose. The VPS SHALL be provisioned via documented infrastructure-as-code (a checked-in Terraform module or a documented `hcloud` CLI script) so it is rebuildable on demand.

#### Scenario: Provisioning audit
- **WHEN** the maintainer destroys and re-creates the VPS following the documented provisioning script
- **THEN** the resulting host runs the same Docker Compose stack with the same exposed services
- **AND** the data is restored from the most recent backup
- **AND** the public domain resolves to the new host within DNS propagation time (< 5 min for DuckDNS)

### Requirement: Docker Compose stack with named services

The Docker Compose stack SHALL declare exactly the following named services: `web` (Next.js application), `db` (Postgres 16+), `caddy` (reverse proxy + TLS termination), `backup` (cron container running daily pg_dump). Service-to-service network MUST be a private Compose network; only `caddy` exposes ports to the public internet (80, 443).

#### Scenario: Network audit
- **WHEN** the Compose stack is up
- **THEN** `docker compose ps` lists exactly the four services with healthy status
- **AND** `caddy` exposes 80 and 443 publicly
- **AND** `web`, `db`, and `backup` expose no public ports
- **AND** `web` connects to `db` via the private Compose network using the service name as hostname

### Requirement: DuckDNS subdomain + Caddy auto-TLS

The application SHALL be served at a DuckDNS subdomain. Caddy SHALL acquire and renew a Let's Encrypt certificate via the DNS-01 challenge against DuckDNS (no inbound port 80 required for renewal). The DuckDNS token SHALL be stored as a Compose secret, never in the repository.

#### Scenario: TLS certificate present
- **WHEN** an HTTPS request is made to `https://<sub>.duckdns.org`
- **THEN** the served certificate chain validates against Let's Encrypt
- **AND** the certificate auto-renews at least 30 days before expiry without manual intervention
- **AND** the DuckDNS token is provided to Caddy via Docker Compose secrets, NOT a checked-in env file

### Requirement: HTTPS-only, security headers

The Caddy configuration SHALL redirect all HTTP traffic to HTTPS, set HSTS with at least one year max-age, and apply baseline security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a Content Security Policy that allows only same-origin scripts plus the share-button targets.

#### Scenario: Headers audit
- **WHEN** an HTTPS request is made to any path
- **THEN** the response includes `Strict-Transport-Security` with `max-age >= 31536000`
- **AND** the response includes `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`
- **AND** the response includes a `Content-Security-Policy` header restricting script sources

### Requirement: Health check + status page

The `web` service SHALL expose a `/healthz` endpoint that returns 200 when the app can read from `db` and 503 otherwise. A maintainer-visible `/status` page SHALL display the most recent backup time, current model latency, and last 24h generation count.

#### Scenario: Database is unreachable
- **WHEN** `db` becomes unreachable to `web`
- **THEN** `/healthz` returns 503
- **AND** Caddy continues to serve cached static pages where possible
- **AND** `/status` (if reachable) shows an error indicator on the database row

### Requirement: Zero-secret-exposure deploy

The deployment process SHALL never write secrets (OpenAI API keys, DuckDNS token, Postgres password, claim-string salt, GCP migration credential during the one-shot migration window) to the repository, the Docker image, or any persistent disk file outside the encrypted Compose secrets path. Secret rotation SHALL be possible without rebuilding the application image.

#### Scenario: Repo audit
- **WHEN** the repository is grep'd for known secret-like strings (`sk-`, `-----BEGIN PRIVATE KEY-----`, etc.) at any commit
- **THEN** zero matches appear in tracked files
- **AND** the `.gitignore` excludes any secrets directory used by the Compose stack
