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

echo "Deploying isolated VC-WMS backend for ${DOMAIN_NAME}"
echo "Frontend is hosted on Vercel. Host nginx remains untouched; HRMS API binds only to 127.0.0.1:4100."

docker compose pull postgres redis
docker compose build api
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

echo "Starting isolated HRMS API..."
# Recreate the API on every deployment so it re-runs startup initialization
# against freshly restarted dependencies such as Redis/Postgres.
docker compose up -d --force-recreate api

# If an older server deployment started the local web container, remove only that HRMS container.
docker compose stop web >/dev/null 2>&1 || true
docker compose rm -f web >/dev/null 2>&1 || true

API_READY=0
for i in {1..30}; do
  api_state="$(docker inspect -f '{{.State.Status}}' hrms-api 2>/dev/null || true)"
  if [[ "$api_state" != "running" ]]; then
    echo "HRMS API exited during startup."
    docker compose ps
    docker logs --tail 120 hrms-api || true
    exit 1
  fi

  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:4100/api/v1/health/ready >/dev/null 2>&1; then
    API_READY=1
    break
  fi

  sleep 2
done

if [[ "$API_READY" != "1" ]]; then
  echo "HRMS API did not become ready within 60 seconds."
  docker compose ps
  docker logs --tail 120 hrms-api || true
  exit 1
fi

docker compose ps

echo
echo_line="------------------------------------------------------------"
echo "$echo_line"
echo "VC-WMS backend is running in isolation"
echo "API readiness: verified"
echo "API upstream:  http://127.0.0.1:4100/api/v1"
echo "Frontend:      Vercel"
echo "Tenant:        vc-organics"
echo "Email:         owner@vcorganics.com"
echo "Password:      ${BOOTSTRAP_PASSWORD}"
echo "$echo_line"
echo "This deployment does not bind or modify host ports 80/443."
