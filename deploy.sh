#!/bin/bash
# Static Wears — Docker Deploy Script
# Run on VPS: bash deploy.sh
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}▶ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

echo -e "${GREEN}"
echo "╔══════════════════════════════════════╗"
echo "║   Static Wears — Docker Deploy       ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── Preflight ─────────────────────────────────────────────────────────────────
command -v docker &>/dev/null || err "Docker not installed. Run: curl -fsSL https://get.docker.com | sudo sh"

[ -f "apps/storefront/.env.production" ] || err "Missing apps/storefront/.env.production — copy from .env.production.example and fill in values"
[ -f "apps/admin/.env.production" ]      || err "Missing apps/admin/.env.production — copy from .env.production.example and fill in values"

# ── Pull latest code ──────────────────────────────────────────────────────────
warn "Pulling latest code..."
git pull origin main
log "Code updated"

# ── Stop PM2 if running (transitioning from old setup) ────────────────────────
if command -v pm2 &>/dev/null; then
  warn "Stopping PM2 processes..."
  pm2 stop all 2>/dev/null || true
  log "PM2 stopped"
fi

# ── Build Docker images ───────────────────────────────────────────────────────
warn "Building Docker images (this takes a few minutes)..."
docker compose build
log "Images built"

# ── Start all containers ──────────────────────────────────────────────────────
warn "Starting containers..."
docker compose up -d
log "Containers started"

# ── Wait for Kafka ────────────────────────────────────────────────────────────
warn "Waiting for Kafka to be ready..."
until docker compose exec kafka kafka-topics.sh --bootstrap-server localhost:9092 --list &>/dev/null; do
  echo "  waiting for Kafka..."
  sleep 5
done
log "Kafka ready"

# ── Clean up old images ───────────────────────────────────────────────────────
docker image prune -f &>/dev/null

# ── Status ────────────────────────────────────────────────────────────────────
echo ""
docker compose ps
echo ""
log "Deployment complete!"
echo ""
echo "  Storefront:   https://staticwears.com"
echo "  Admin:        https://admin.staticwears.com"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f storefront   # storefront logs"
echo "    docker compose logs -f admin        # admin logs"
echo "    docker compose logs -f kafka        # kafka logs"
echo "    docker compose logs -f email-worker # email worker logs"
echo "    docker compose ps                   # container status"
