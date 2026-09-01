#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DOMAIN_NAME="${DOMAIN_NAME:-hrms.vcorganics.com}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required on the server. Install Docker Engine + Compose plugin, then rerun this command."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running or this user cannot access it."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is required."
  exit 1
fi

random_hex() {
  openssl rand -hex "$1"
}

if [[ ! -f .env ]]; then
  BOOTSTRAP_PASSWORD="VC-$(random_hex 12)"
  cat > .env <<EOF
DOMAIN_NAME=${DOMAIN_NAME}
POSTGRES_DB=vc_hrms_prod
POSTGRES_USER=hrms_admin
POSTGRES_PASSWORD=$(random_hex 24)
REDIS_PASSWORD=$(random_hex 24)
JWT_ACCESS_SECRET=$(random_hex 48)
JWT_REFRESH_SECRET=$(random_hex 48)
JWT_SECRET=$(random_hex 48)
COOKIE_SECRET=$(random_hex 48)
CSRF_SECRET=$(random_hex 48)
BOOTSTRAP_PASSWORD=${BOOTSTRAP_PASSWORD}
VC_ORGANICS_OWNER_EMAIL=owner@vcorganics.com
PLATFORM_ADMIN_EMAILS=admin@example.com
CORS_ORIGINS=https://${DOMAIN_NAME}
GEMINI_API_KEY=
OPENAI_API_KEY=
EOF
  chmod 600 .env
  echo "Created production .env with generated secrets."
else
  BOOTSTRAP_PASSWORD="$(grep '^BOOTSTRAP_PASSWORD=' .env | cut -d= -f2- || true)"
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

required=(POSTGRES_PASSWORD REDIS_PASSWORD JWT_ACCESS_SECRET JWT_REFRESH_SECRET JWT_SECRET COOKIE_SECRET CSRF_SECRET BOOTSTRAP_PASSWORD)
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required value in .env: ${key}"
    exit 1
  fi
done

echo "Deploying isolated VC-WMS services for ${DOMAIN_NAME}"
echo "Host nginx remains untouched; HRMS binds only to 127.0.0.1:3100 and 127.0.0.1:4100."

docker compose pull postgres redis
docker compose build api web
docker compose up -d postgres redis

for i in {1..30}; do
  pg_status="$(docker inspect -f '{{.State.Health.Status}}' hrms-postgres 2>/dev/null || true)"
  redis_status="$(docker inspect -f '{{.State.Health.Status}}' hrms-redis 2>/dev/null || true)"
  if [[ "$pg_status" == "healthy" && "$redis_status" == "healthy" ]]; then
    break
  fi
  if [[ "$i" == "30" ]]; then
    echo "Database services did not become healthy."
    docker compose ps
    exit 1
  fi
  sleep 2
done

echo "Synchronizing Prisma schema..."
docker compose run --rm api pnpm --filter @vc-wms/api exec prisma db push --skip-generate

echo "Seeding VC Organics tenant and login users..."
docker compose run --rm api pnpm --filter @vc-wms/api prisma:seed

echo "Starting isolated API and web services..."
docker compose up -d api web

docker compose ps

echo
echo_line="------------------------------------------------------------"
echo "$echo_line"
echo "VC-WMS application containers are running in isolation"
echo "Web upstream:  http://127.0.0.1:3100"
echo "API upstream:  http://127.0.0.1:4100/api/v1"
echo "Domain:        https://${DOMAIN_NAME} (after host nginx vhost is added)"
echo "Tenant:        vc-organics"
echo "Email:         owner@vcorganics.com"
echo "Password:      ${BOOTSTRAP_PASSWORD}"
echo "$echo_line"
echo "This deployment does not bind or modify host ports 80/443."
