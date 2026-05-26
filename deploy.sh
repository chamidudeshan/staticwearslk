#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Static Wears — VPS Deploy Script
# Run this on your VPS after initial setup.
# ═══════════════════════════════════════════════════════════════
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}▶ Static Wears Deploy${NC}"

# ── Preflight checks ─────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo -e "${RED}ERROR: .env file not found.${NC}"
  echo "Copy .env.production.example to .env and fill in all values."
  exit 1
fi

if ! command -v docker &> /dev/null; then
  echo -e "${RED}ERROR: Docker not installed.${NC}"
  exit 1
fi

if ! command -v docker compose &> /dev/null; then
  echo -e "${RED}ERROR: Docker Compose not installed.${NC}"
  exit 1
fi

# ── Pull latest code ─────────────────────────────────────────────
echo -e "${YELLOW}▶ Pulling latest code...${NC}"
git pull origin main

# ── Create nginx ssl directory ───────────────────────────────────
mkdir -p nginx/ssl
mkdir -p volumes/api

# ── Copy Kong config if missing ──────────────────────────────────
if [ ! -f "volumes/api/kong.yml" ]; then
  echo -e "${YELLOW}▶ Creating Kong config...${NC}"
  cat > volumes/api/kong.yml << 'KONG'
_format_version: "1.1"

services:
  - name: auth-v1-open
    url: http://auth:9999/verify
    routes:
      - name: auth-v1-open
        strip_path: true
        paths:
          - /auth/v1/verify
    plugins:
      - name: cors

  - name: auth-v1
    url: http://auth:9999
    routes:
      - name: auth-v1-all
        strip_path: true
        paths:
          - /auth/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - anon
            - service_role

  - name: rest-v1
    url: http://rest:3000/
    routes:
      - name: rest-v1-all
        strip_path: true
        paths:
          - /rest/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: true
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - anon
            - service_role

  - name: realtime-v1
    url: http://realtime:4000/socket/
    routes:
      - name: realtime-v1-all
        strip_path: true
        paths:
          - /realtime/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - anon
            - service_role

  - name: storage-v1
    url: http://storage:5000/
    routes:
      - name: storage-v1-all
        strip_path: true
        paths:
          - /storage/v1/
    plugins:
      - name: cors

consumers:
  - username: anon
    keyauth_credentials:
      - key: ${ANON_KEY}
  - username: service_role
    keyauth_credentials:
      - key: ${SERVICE_ROLE_KEY}

acls:
  - consumer: anon
    group: anon
  - consumer: service_role
    group: service_role
KONG
fi

# ── SSL Certificates (Let's Encrypt) ────────────────────────────
echo -e "${YELLOW}▶ Setting up SSL certificates...${NC}"
if ! command -v certbot &> /dev/null; then
  apt-get install -y certbot
fi

source .env

if [ ! -f "nginx/ssl/staticwears.lk.crt" ]; then
  echo "Obtaining SSL certificate for staticwears.lk..."
  certbot certonly --standalone \
    -d staticwears.lk \
    -d www.staticwears.lk \
    -d admin.staticwears.lk \
    -d api.staticwears.lk \
    --non-interactive --agree-tos \
    -m "$SMTP_ADMIN_EMAIL"

  cp /etc/letsencrypt/live/staticwears.lk/fullchain.pem nginx/ssl/staticwears.lk.crt
  cp /etc/letsencrypt/live/staticwears.lk/privkey.pem nginx/ssl/staticwears.lk.key
  cp /etc/letsencrypt/live/staticwears.lk/fullchain.pem nginx/ssl/admin.staticwears.lk.crt
  cp /etc/letsencrypt/live/staticwears.lk/privkey.pem nginx/ssl/admin.staticwears.lk.key
  cp /etc/letsencrypt/live/staticwears.lk/fullchain.pem nginx/ssl/api.staticwears.lk.crt
  cp /etc/letsencrypt/live/staticwears.lk/privkey.pem nginx/ssl/api.staticwears.lk.key
fi

# ── Build and start ──────────────────────────────────────────────
echo -e "${YELLOW}▶ Building Docker images...${NC}"
docker compose build --no-cache storefront admin

echo -e "${YELLOW}▶ Starting all services...${NC}"
docker compose up -d

# ── Wait for DB ──────────────────────────────────────────────────
echo -e "${YELLOW}▶ Waiting for database to be ready...${NC}"
until docker compose exec db pg_isready -U postgres > /dev/null 2>&1; do
  echo "  waiting..."
  sleep 3
done

echo -e "${GREEN}✓ All services started.${NC}"
echo ""
echo -e "  Storefront:  ${GREEN}https://staticwears.lk${NC}"
echo -e "  Admin:       ${GREEN}https://admin.staticwears.lk${NC}"
echo -e "  Supabase API:${GREEN}https://api.staticwears.lk${NC}"
echo ""
echo "  Run 'docker compose logs -f' to watch logs."
echo "  Run 'docker compose ps' to check service status."
