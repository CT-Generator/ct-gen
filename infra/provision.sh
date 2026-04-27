#!/usr/bin/env bash
# Conspiracy Generator v2 — Hetzner provisioning script (skeleton).
# Spec: openspec/changes/v2-rebuild/specs/infrastructure/spec.md
#
# Run this from your local machine. It uses the `hcloud` CLI to provision a CAX11
# (ARM, 2 vCPU / 4GB / 40GB SSD) and then SSHes in to harden + install Docker.
#
# Prerequisites:
#   1. brew install hcloud  (or equivalent for your OS)
#   2. hcloud context create cgen           # one-time auth
#   3. Add your SSH public key to Hetzner Cloud project console
#   4. Set the env vars below

set -euo pipefail

: "${HCLOUD_SSH_KEY_NAME:?must export HCLOUD_SSH_KEY_NAME (the key name registered in Hetzner Cloud)}"
SERVER_NAME="${SERVER_NAME:-cgen-prod}"
SERVER_TYPE="${SERVER_TYPE:-cax11}"
IMAGE="${IMAGE:-debian-12}"
LOCATION="${LOCATION:-fsn1}"

echo "[1/5] Creating server ${SERVER_NAME} (${SERVER_TYPE} @ ${LOCATION})..."
hcloud server create \
  --name "${SERVER_NAME}" \
  --type "${SERVER_TYPE}" \
  --image "${IMAGE}" \
  --location "${LOCATION}" \
  --ssh-key "${HCLOUD_SSH_KEY_NAME}" \
  --start-after-create

IP="$(hcloud server ip "${SERVER_NAME}")"
echo "[1/5] Server up at ${IP}"

# Wait for SSH to come online.
for i in {1..30}; do
  if ssh -o StrictHostKeyChecking=no -o BatchMode=yes "root@${IP}" 'echo ok' 2>/dev/null; then
    break
  fi
  sleep 5
done

echo "[2/5] Hardening SSH + installing baseline packages..."
ssh -o StrictHostKeyChecking=no "root@${IP}" 'bash -s' <<'REMOTE'
set -euo pipefail

apt-get update
apt-get install -y --no-install-recommends ca-certificates curl gnupg ufw fail2ban

# Disable root password login; enable key-only auth.
sed -i -E 's/^#?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i -E 's/^#?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl reload sshd

# Firewall — deny incoming default + 22/80/443 allow.
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl enable --now fail2ban
REMOTE

echo "[3/5] Installing Docker Engine + Compose plugin (official Docker apt repo)..."
ssh -o StrictHostKeyChecking=no "root@${IP}" 'bash -s' <<'REMOTE'
set -euo pipefail

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker
REMOTE

echo "[4/5] Creating non-root deploy user..."
ssh -o StrictHostKeyChecking=no "root@${IP}" 'bash -s' <<'REMOTE'
set -euo pipefail
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos '' deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
REMOTE

echo "[5/5] Done. Next steps:"
cat <<EOM

  1. Point the DuckDNS A record for conspiracy-generator.duckdns.org → ${IP}
  2. Copy this repo to the box: rsync -av ./ deploy@${IP}:/home/deploy/cgen/
  3. SSH as deploy@${IP}, populate infra/secrets/*.txt (see infra/secrets/README.md)
  4. cd cgen/infra && docker compose up -d --build
  5. Verify https://conspiracy-generator.duckdns.org loads with a valid TLS cert
EOM
