#!/bin/bash
# Migrate data from hosted Supabase → self-hosted PostgreSQL
# Run this AFTER self-hosted Supabase is up and healthy
# Usage: bash supabase/migrate.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}▶ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

echo ""
echo "═══════════════════════════════════════════════"
echo "  Static Wears — Supabase Migration Script"
echo "═══════════════════════════════════════════════"
echo ""

# ── Require env vars ──────────────────────────────────────────────────────────
[ -z "$HOSTED_DB_URL" ] && err "Set HOSTED_DB_URL first. Example:
  export HOSTED_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"

[ -z "$POSTGRES_PASSWORD" ] && err "Set POSTGRES_PASSWORD (from your .env.supabase file)"

warn "Installing pg_dump tool..."
sudo apt-get install -y postgresql-client > /dev/null 2>&1
log "pg_dump ready"

# ── Export schema from hosted Supabase ────────────────────────────────────────
warn "Exporting schema from hosted Supabase..."
pg_dump "$HOSTED_DB_URL" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  -f /tmp/schema.sql
log "Schema exported to /tmp/schema.sql"

# ── Export data from hosted Supabase ─────────────────────────────────────────
warn "Exporting data from hosted Supabase (this may take a while)..."
pg_dump "$HOSTED_DB_URL" \
  --schema=public \
  --data-only \
  --no-owner \
  --no-acl \
  --disable-triggers \
  -f /tmp/data.sql
log "Data exported to /tmp/data.sql"

# ── Wait for self-hosted DB to be ready ───────────────────────────────────────
warn "Waiting for self-hosted PostgreSQL..."
until docker compose exec db pg_isready -U postgres > /dev/null 2>&1; do
  echo "  waiting..."
  sleep 3
done
log "PostgreSQL ready"

# ── Import schema into self-hosted ────────────────────────────────────────────
warn "Importing schema into self-hosted PostgreSQL..."
docker compose exec -T db psql -U postgres -d postgres < /tmp/schema.sql
log "Schema imported"

# ── Import data into self-hosted ─────────────────────────────────────────────
warn "Importing data into self-hosted PostgreSQL..."
docker compose exec -T db psql -U postgres -d postgres < /tmp/data.sql
log "Data imported"

# ── Migrate storage files ─────────────────────────────────────────────────────
warn "To migrate storage (product images), run:"
echo ""
echo "  1. Install supabase CLI: npm install -g supabase"
echo "  2. Download files: supabase storage ls --project-ref [YOUR-REF]"
echo "  3. Or manually download from Supabase dashboard → Storage"
echo "     and re-upload via admin panel after switching to self-hosted"
echo ""

# ── Update image URLs in database ─────────────────────────────────────────────
warn "After storage migration, update image URLs in the database:"
echo ""
echo "  Run this inside the db container:"
echo "  docker compose exec db psql -U postgres -d postgres -c \\"
echo "  \"UPDATE product_images SET image_path = REPLACE(image_path, 'https://[OLD-PROJECT].supabase.co', 'https://api.staticwears.com');\""
echo "  \"UPDATE product_variants SET image_url = REPLACE(image_url, 'https://[OLD-PROJECT].supabase.co', 'https://api.staticwears.com') WHERE image_url IS NOT NULL;\""
echo "  \"UPDATE banners SET image_url = REPLACE(image_url, 'https://[OLD-PROJECT].supabase.co', 'https://api.staticwears.com') WHERE image_url IS NOT NULL;\""
echo ""

log "Migration complete! Update your .env.production files and rebuild."
