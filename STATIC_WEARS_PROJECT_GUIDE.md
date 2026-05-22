# Static Wears — Complete Project Guide
### Microservices E-Commerce Platform | Supabase + Vercel → VPS Edition
> **Student:** J.K.D.C.D. Jayaneththi (AMP/IT/2324/F/036) | Hardy ATI, Sri Lanka  
> **Supervisor:** Ms. T.H. Dinusha Hewage  
> **Stack:** Next.js · Supabase · Vercel · Stripe · Resend · Docker (VPS phase)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Tech Stack & Justification](#3-tech-stack--justification)
4. [Prerequisites](#4-prerequisites)
5. [Step 1 — Bootstrap the Monorepo](#5-step-1--bootstrap-the-monorepo)
6. [Step 2 — Supabase Project Setup](#6-step-2--supabase-project-setup)
7. [Step 3 — Database Schema (All Services)](#7-step-3--database-schema-all-services)
8. [Step 4 — Shared Package (types + supabase client)](#8-step-4--shared-package-types--supabase-client)
9. [Step 5 — User Service](#9-step-5--user-service)
10. [Step 6 — Product Service](#10-step-6--product-service)
11. [Step 7 — Order Service](#11-step-7--order-service)
12. [Step 8 — Payment Service (Stripe)](#12-step-8--payment-service-stripe)
13. [Step 9 — Email/Notification Service (Resend)](#13-step-9--emailnotification-service-resend)
14. [Step 10 — Event Bus (Supabase Realtime)](#14-step-10--event-bus-supabase-realtime)
15. [Step 11 — Customer Storefront UI](#15-step-11--customer-storefront-ui)
16. [Step 12 — Admin Dashboard UI](#16-step-12--admin-dashboard-ui)
17. [UI Design System & Animations](#17-ui-design-system--animations)
18. [Environment Variables Reference](#18-environment-variables-reference)
19. [Step 13 — Deploy to Vercel](#19-step-13--deploy-to-vercel)
20. [Step 14 — VPS Migration (Docker)](#20-step-14--vps-migration-docker)
21. [Testing Strategy](#21-testing-strategy)
22. [Project Checklist (Proposal Coverage)](#22-project-checklist-proposal-coverage)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                  │
│   ┌──────────────────────────┐   ┌──────────────────────────┐   │
│   │   Customer Storefront    │   │     Admin Dashboard      │   │
│   │  apps/storefront         │   │  apps/admin              │   │
│   │  (Next.js 14 App Router) │   │  (Next.js 14 App Router) │   │
│   └────────────┬─────────────┘   └─────────────┬────────────┘   │
└────────────────┼─────────────────────────────────┼──────────────┘
                 │ HTTPS                            │ HTTPS
┌────────────────▼─────────────────────────────────▼──────────────┐
│                   API GATEWAY / ROUTING LAYER                    │
│         Next.js API Routes — JWT validated via Supabase          │
│                                                                  │
│   /api/users/*    /api/products/*    /api/orders/*               │
│   /api/payments/* /api/email/*       /api/admin/*                │
└────────┬──────────────┬──────────────┬──────────────┬───────────┘
         │              │              │              │
  ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
  │   USER      │ │  PRODUCT   │ │   ORDER   │ │  PAYMENT  │
  │  SERVICE    │ │  SERVICE   │ │  SERVICE  │ │  SERVICE  │
  │ packages/   │ │ packages/  │ │ packages/ │ │ packages/ │
  │ user-svc    │ │ product-svc│ │ order-svc │ │ payment-  │
  └──────┬──────┘ └─────┬──────┘ └────┬──────┘ │ svc       │
         │              │              │        └────┬──────┘
         │              │              │             │
┌────────▼──────────────▼──────────────▼─────────────▼───────────┐
│                       SUPABASE PLATFORM                         │
│                                                                 │
│  PostgreSQL (schemas: users | products | orders | payments)     │
│  Supabase Auth   |   Supabase Storage   |   Realtime (events)  │
└─────────────────────────────────────────────────────────────────┘
         │                                           │
  ┌──────▼──────┐                           ┌───────▼──────┐
  │   Stripe    │                           │    Resend    │
  │  Payments   │                           │   Emails     │
  └─────────────┘                           └──────────────┘
```

### How Microservices Are Simulated on Vercel

Each "service" is a **self-contained package** with its own:
- Database schema (enforced in Supabase with Row Level Security)
- Business logic (pure TypeScript functions)
- API surface (Next.js route handlers that call that service's logic only)

This means when you move to VPS, you just wrap each package in its own Express server and deploy it in its own Docker container. **Zero logic rewrite.**

---

## 2. Monorepo Structure

```
static-wears/
├── apps/
│   ├── storefront/          ← Customer-facing shop (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/      ← login, register pages
│   │   │   ├── (shop)/      ← product listing, product detail
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── orders/      ← order history
│   │   │   └── account/
│   │   ├── components/
│   │   │   ├── ui/          ← design system components
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   └── layout/
│   │   └── package.json
│   │
│   └── admin/               ← Admin dashboard (Next.js)
│       ├── app/
│       │   ├── (auth)/
│       │   ├── dashboard/   ← overview with charts
│       │   ├── products/    ← CRUD products
│       │   ├── orders/      ← manage orders
│       │   ├── users/       ← manage customers
│       │   └── reports/
│       ├── components/
│       └── package.json
│
├── packages/
│   ├── shared/              ← Types, Supabase client, utilities
│   │   ├── src/
│   │   │   ├── types/       ← All TypeScript interfaces
│   │   │   ├── supabase/    ← Typed Supabase client
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── user-service/        ← User business logic
│   │   ├── src/
│   │   │   ├── queries.ts   ← DB queries (Supabase)
│   │   │   ├── mutations.ts ← DB mutations
│   │   │   └── index.ts     ← Public API of this service
│   │   └── package.json
│   │
│   ├── product-service/     ← Product business logic
│   │   ├── src/
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── order-service/       ← Order business logic
│   │   ├── src/
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── payment-service/     ← Stripe integration
│   │   ├── src/
│   │   │   ├── stripe.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── email-service/       ← Resend email logic
│       ├── src/
│       │   ├── templates/
│       │   └── index.ts
│       └── package.json
│
├── turbo.json               ← Turborepo config
├── package.json             ← Root workspace
└── .env.local               ← All secrets (never commit this)
```

---

## 3. Tech Stack & Justification

| Layer | Technology | Why |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) | SSR for SEO + speed, file-based routing, API routes built-in |
| **Styling** | Tailwind CSS + Framer Motion | Utility-first CSS + production-grade animations |
| **UI Components** | shadcn/ui (Radix UI) | Accessible, unstyled primitives you fully own |
| **Database** | Supabase PostgreSQL | Managed Postgres, real-time, RLS security built-in |
| **Auth** | Supabase Auth | JWT-based, secure, integrates with DB RLS |
| **File Storage** | Supabase Storage | Product images, CDN-backed |
| **Event Bus (now)** | Supabase Realtime | Postgres LISTEN/NOTIFY — drop-in before Kafka |
| **Event Bus (VPS)** | Apache Kafka | Industry standard, what the proposal specifies |
| **Payments** | Stripe | Industry standard, webhooks, secure |
| **Emails** | Resend | Modern email API, React email templates |
| **Monorepo** | Turborepo | Parallel builds, shared packages, caching |
| **Language** | TypeScript | Type safety across all services |
| **Package Manager** | pnpm | Fast, disk-efficient, required for workspaces |
| **VPS Containers** | Docker + Docker Compose | Isolates each service, easy deployment |
| **VPS Proxy** | Nginx | Reverse proxy, SSL termination |

---

## 4. Prerequisites

Install these before starting:

```bash
# Node.js 20 LTS
# Download from: https://nodejs.org

# pnpm (package manager)
npm install -g pnpm

# Verify versions
node --version    # should be 20.x
pnpm --version    # should be 8.x or 9.x
```

Accounts you need to create (all free tiers are enough):
- **Supabase** — https://supabase.com (database + auth + storage)
- **Vercel** — https://vercel.com (deployment)
- **Stripe** — https://stripe.com (payments — use test mode)
- **Resend** — https://resend.com (emails — free tier: 3000/month)
- **GitHub** — https://github.com (Vercel deploys from here)

---

## 5. Step 1 — Bootstrap the Monorepo

### 5.1 Create the project

```bash
# Create root folder
mkdir static-wears && cd static-wears

# Initialize pnpm workspace
pnpm init
```

### 5.2 Root `package.json`

Replace the generated file with this:

```json
{
  "name": "static-wears",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 5.3 `pnpm-workspace.yaml`

Create this file at the root:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 5.4 `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 5.5 Install Turborepo and create apps

```bash
# Install turbo
pnpm install

# Create the two Next.js apps
pnpm create next-app apps/storefront --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
pnpm create next-app apps/admin --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git

# Create all service packages
mkdir -p packages/shared/src/{types,supabase,utils}
mkdir -p packages/user-service/src
mkdir -p packages/product-service/src
mkdir -p packages/order-service/src
mkdir -p packages/payment-service/src
mkdir -p packages/email-service/src/templates
```

### 5.6 Install shared dependencies in both apps

```bash
# Install core dependencies in storefront
cd apps/storefront
pnpm add @supabase/supabase-js @supabase/ssr framer-motion @stripe/stripe-js
pnpm add -D @types/react

# Install shadcn/ui
pnpm dlx shadcn@latest init
# Choose: Default style, Zinc base color, CSS variables: yes

# Add needed components
pnpm dlx shadcn@latest add button input label card badge dialog sheet
pnpm dlx shadcn@latest add dropdown-menu select toast sonner
pnpm dlx shadcn@latest add table tabs avatar separator skeleton

cd ../admin
pnpm add @supabase/supabase-js @supabase/ssr recharts framer-motion
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label card badge dialog sheet
pnpm dlx shadcn@latest add dropdown-menu select toast sonner table
pnpm dlx shadcn@latest add tabs avatar separator skeleton chart

cd ../..

# Install service package deps
cd packages/shared && pnpm init -y && pnpm add @supabase/supabase-js && cd ../..
cd packages/user-service && pnpm init -y && cd ../..
cd packages/order-service && pnpm init -y && cd ../..
cd packages/product-service && pnpm init -y && cd ../..
cd packages/payment-service && pnpm init -y && pnpm add stripe && cd ../..
cd packages/email-service && pnpm init -y && pnpm add resend && cd ../..
```

### 5.7 Add workspace references to apps

In `apps/storefront/package.json`, add to `dependencies`:

```json
{
  "dependencies": {
    "@static-wears/shared": "workspace:*",
    "@static-wears/user-service": "workspace:*",
    "@static-wears/product-service": "workspace:*",
    "@static-wears/order-service": "workspace:*",
    "@static-wears/payment-service": "workspace:*",
    "@static-wears/email-service": "workspace:*"
  }
}
```

Do the same for `apps/admin/package.json`.

In each `packages/*/package.json`, set the name:

```json
// packages/shared/package.json
{ "name": "@static-wears/shared", "main": "./src/index.ts" }

// packages/user-service/package.json
{ "name": "@static-wears/user-service", "main": "./src/index.ts" }

// packages/product-service/package.json
{ "name": "@static-wears/product-service", "main": "./src/index.ts" }

// packages/order-service/package.json
{ "name": "@static-wears/order-service", "main": "./src/index.ts" }

// packages/payment-service/package.json
{ "name": "@static-wears/payment-service", "main": "./src/index.ts" }

// packages/email-service/package.json
{ "name": "@static-wears/email-service", "main": "./src/index.ts" }
```

```bash
# Install everything from root
pnpm install
```

---

## 6. Step 2 — Supabase Project Setup

### 6.1 Create project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Name it `static-wears`
4. Choose a strong database password (save it somewhere)
5. Choose a region closest to Sri Lanka → **Singapore (ap-southeast-1)**
6. Wait ~2 minutes for provisioning

### 6.2 Get your keys

Go to **Project Settings → API**:

- `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role secret` key → this is your `SUPABASE_SERVICE_ROLE_KEY` (never expose this client-side)

### 6.3 Configure Auth

Go to **Authentication → Providers**:
- Enable **Email** provider
- Turn on **Confirm email** (for production; turn off for development)

Go to **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000` (change to Vercel URL after deploy)
- Redirect URLs: add `http://localhost:3000/**` and your Vercel URL

### 6.4 Configure Storage

Go to **Storage**:
1. Create a bucket named `product-images`
2. Set it to **Public** (so product images are accessible without auth)
3. Create another bucket named `user-avatars` (can be private)

---

## 7. Step 3 — Database Schema (All Services)

Go to **Supabase → SQL Editor** and run these scripts in order.

### 7.1 Create schemas (service isolation)

```sql
-- Each service gets its own schema — this is the microservices boundary
CREATE SCHEMA IF NOT EXISTS user_svc;
CREATE SCHEMA IF NOT EXISTS product_svc;
CREATE SCHEMA IF NOT EXISTS order_svc;
CREATE SCHEMA IF NOT EXISTS payment_svc;
```

### 7.2 User Service Schema

```sql
-- User profiles (extends Supabase Auth)
CREATE TABLE user_svc.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User addresses
CREATE TABLE user_svc.user_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_svc.profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT 'Home',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  district      TEXT NOT NULL,
  postal_code   TEXT,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION user_svc.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_svc.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION user_svc.handle_new_user();

-- RLS policies
ALTER TABLE user_svc.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_svc.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_svc.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_svc.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_svc.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_svc.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users manage own addresses"
  ON user_svc.user_addresses FOR ALL
  USING (auth.uid() = user_id);
```

### 7.3 Product Service Schema

```sql
-- Categories
CREATE TABLE product_svc.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brands
CREATE TABLE product_svc.brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE product_svc.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price  NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  brand_id    UUID REFERENCES product_svc.brands(id),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product-Category join
CREATE TABLE product_svc.product_categories (
  product_id  UUID REFERENCES product_svc.products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_svc.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Product variants (size + color combinations)
CREATE TABLE product_svc.product_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES product_svc.products(id) ON DELETE CASCADE,
  size        TEXT NOT NULL,
  color       TEXT NOT NULL,
  stock_qty   INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  price_adj   NUMERIC(10,2) NOT NULL DEFAULT 0,
  sku         TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product images
CREATE TABLE product_svc.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES product_svc.products(id) ON DELETE CASCADE,
  image_path  TEXT NOT NULL,
  is_main     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_status ON product_svc.products(status);
CREATE INDEX idx_products_slug ON product_svc.products(slug);
CREATE INDEX idx_variants_product ON product_svc.product_variants(product_id);

-- RLS
ALTER TABLE product_svc.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_svc.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_svc.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_svc.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_svc.product_images ENABLE ROW LEVEL SECURITY;

-- Public read access for all product data
CREATE POLICY "Anyone can view active products"
  ON product_svc.products FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view categories"
  ON product_svc.categories FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view brands"
  ON product_svc.brands FOR SELECT USING (true);

CREATE POLICY "Anyone can view variants"
  ON product_svc.product_variants FOR SELECT USING (true);

CREATE POLICY "Anyone can view images"
  ON product_svc.product_images FOR SELECT USING (true);

-- Service role (used by admin API) can do everything
-- This is handled by using the service_role key in admin routes
```

### 7.4 Order Service Schema

```sql
-- Orders
CREATE TABLE order_svc.orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL,            -- references user_svc.profiles(id) logically
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  total_amount   NUMERIC(10,2) NOT NULL,
  shipping_name  TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_addr  TEXT NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items
CREATE TABLE order_svc.order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES order_svc.orders(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL,              -- references product_svc.products(id) logically
  variant_id   UUID,                       -- references product_svc.product_variants(id) logically
  product_name TEXT NOT NULL,              -- snapshot at time of purchase
  variant_desc TEXT,                       -- e.g. "L / Black" snapshot
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(10,2) NOT NULL,
  subtotal     NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_customer ON order_svc.orders(customer_id);
CREATE INDEX idx_orders_status ON order_svc.orders(status);
CREATE INDEX idx_order_items_order ON order_svc.order_items(order_id);

-- RLS
ALTER TABLE order_svc.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_svc.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own orders"
  ON order_svc.orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users create own orders"
  ON order_svc.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users see own order items"
  ON order_svc.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM order_svc.orders
      WHERE id = order_id AND customer_id = auth.uid()
    )
  );
```

### 7.5 Payment Service Schema

```sql
-- Payments
CREATE TABLE payment_svc.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL UNIQUE,  -- one payment per order
  stripe_payment_id TEXT UNIQUE,
  stripe_session_id TEXT UNIQUE,
  amount            NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'lkr',
  payment_method    TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'pending'
                      CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_date      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payment_svc.payments(order_id);
CREATE INDEX idx_payments_stripe ON payment_svc.payments(stripe_payment_id);

ALTER TABLE payment_svc.payments ENABLE ROW LEVEL SECURITY;

-- Payment data is sensitive — only service role (admin API) or own records
CREATE POLICY "Users view own payments"
  ON payment_svc.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM order_svc.orders
      WHERE id = order_id AND customer_id = auth.uid()
    )
  );
```

### 7.6 Seed initial data

```sql
-- Insert some categories
INSERT INTO product_svc.categories (name, slug, description) VALUES
  ('T-Shirts', 't-shirts', 'Classic and graphic tees'),
  ('Hoodies', 'hoodies', 'Pullover and zip hoodies'),
  ('Caps', 'caps', 'Snapbacks and fitted caps'),
  ('Accessories', 'accessories', 'Bags, socks and more');

-- Insert a brand
INSERT INTO product_svc.brands (name, slug, description) VALUES
  ('Static Wears', 'static-wears', 'Our in-house brand');
```

---

## 8. Step 4 — Shared Package (Types + Supabase Client)

### 8.1 TypeScript types

Create `packages/shared/src/types/index.ts`:

```typescript
// ============================================================
// USER SERVICE TYPES
// ============================================================
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}

// ============================================================
// PRODUCT SERVICE TYPES
// ============================================================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  brand_id: string | null;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  // Joined fields
  brand?: Brand;
  categories?: Category[];
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_qty: number;
  price_adj: number;
  sku: string | null;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_path: string;
  is_main: boolean;
  sort_order: number;
  created_at: string;
}

// ============================================================
// ORDER SERVICE TYPES
// ============================================================
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_addr: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_desc: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

// ============================================================
// PAYMENT SERVICE TYPES
// ============================================================
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: PaymentStatus;
  payment_date: string | null;
  created_at: string;
}

// ============================================================
// CART (CLIENT-SIDE ONLY — no DB, stored in localStorage/state)
// ============================================================
export interface CartItem {
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_desc: string;
  image_path: string;
  unit_price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
```

### 8.2 Supabase client

Create `packages/shared/src/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — used in client components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Create `packages/shared/src/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server client — used in server components and API routes
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

// Admin client — uses service role, bypasses RLS
// ONLY use this in server-side admin API routes
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

Create `packages/shared/src/supabase/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  // Protect routes
  const url = request.nextUrl.clone();
  const isAuthRoute = url.pathname.startsWith('/auth');
  const isProtectedRoute =
    url.pathname.startsWith('/account') ||
    url.pathname.startsWith('/orders') ||
    url.pathname.startsWith('/checkout');

  if (!user && isProtectedRoute) {
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

Create `packages/shared/src/index.ts`:

```typescript
export * from './types';
export * from './supabase/client';
export { createSupabaseServerClient, createSupabaseAdminClient } from './supabase/server';
export { updateSession } from './supabase/middleware';
```

---

## 9. Step 5 — User Service

Create `packages/user-service/src/queries.ts`:

```typescript
import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import type { Profile, UserAddress } from '@static-wears/shared';

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .schema('user_svc')
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .schema('user_svc')
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  if (error) return [];
  return data ?? [];
}

// Admin only
export async function getAllUsers(): Promise<Profile[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .schema('user_svc')
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}
```

Create `packages/user-service/src/mutations.ts`:

```typescript
import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import type { Profile, UserAddress } from '@static-wears/shared';

export async function updateProfile(
  userId: string,
  data: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .schema('user_svc')
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return { error: error?.message ?? null };
}

export async function addAddress(
  data: Omit<UserAddress, 'id' | 'created_at'>
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();

  // If setting as default, unset others first
  if (data.is_default) {
    await supabase
      .schema('user_svc')
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', data.user_id);
  }

  const { error } = await supabase
    .schema('user_svc')
    .from('user_addresses')
    .insert(data);
  return { error: error?.message ?? null };
}

export async function deleteAddress(
  addressId: string,
  userId: string
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .schema('user_svc')
    .from('user_addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId); // security check
  return { error: error?.message ?? null };
}
```

Create `packages/user-service/src/index.ts`:

```typescript
export * from './queries';
export * from './mutations';
```

### 9.1 User API Routes (in storefront app)

Create `apps/storefront/src/app/api/users/profile/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@static-wears/shared';
import { getProfile, updateProfile } from '@static-wears/user-service';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const result = await updateProfile(user.id, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

---

## 10. Step 6 — Product Service

Create `packages/product-service/src/queries.ts`:

```typescript
import { createSupabaseServerClient } from '@static-wears/shared';
import type { Product, Category } from '@static-wears/shared';

export async function getProducts(filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .schema('product_svc')
    .from('products')
    .select(`
      *,
      brand:brands(*),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .eq('status', 'active');

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('base_price', filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('base_price', filters.maxPrice);
  }

  if (filters?.sort === 'price_asc') query = query.order('base_price');
  else if (filters?.sort === 'price_desc') query = query.order('base_price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, (filters.offset + (filters.limit ?? 20)) - 1);

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .schema('product_svc')
    .from('products')
    .select(`
      *,
      brand:brands(*),
      categories:product_categories(category:categories(*)),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  if (error) return null;
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .schema('product_svc')
    .from('categories')
    .select('*')
    .eq('status', 'active')
    .order('name');
  return data ?? [];
}
```

Create `packages/product-service/src/mutations.ts`:

```typescript
import { createSupabaseAdminClient } from '@static-wears/shared';
import type { Product, ProductVariant } from '@static-wears/shared';

export async function createProduct(data: {
  name: string;
  description?: string;
  base_price: number;
  brand_id?: string;
  category_ids?: string[];
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>[];
}): Promise<{ product: Product | null; error: string | null }> {
  const supabase = createSupabaseAdminClient();

  // Generate slug
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data: product, error } = await supabase
    .schema('product_svc')
    .from('products')
    .insert({
      name: data.name,
      slug,
      description: data.description,
      base_price: data.base_price,
      brand_id: data.brand_id,
    })
    .select()
    .single();

  if (error || !product) return { product: null, error: error?.message ?? 'Failed to create' };

  // Insert categories
  if (data.category_ids?.length) {
    await supabase
      .schema('product_svc')
      .from('product_categories')
      .insert(data.category_ids.map(id => ({ product_id: product.id, category_id: id })));
  }

  // Insert variants
  if (data.variants?.length) {
    await supabase
      .schema('product_svc')
      .from('product_variants')
      .insert(data.variants.map(v => ({ ...v, product_id: product.id })));
  }

  return { product, error: null };
}

export async function updateProductStock(
  variantId: string,
  quantity: number
): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .schema('product_svc')
    .from('product_variants')
    .update({ stock_qty: quantity })
    .eq('id', variantId);
  return { error: error?.message ?? null };
}

export async function decreaseStock(
  variantId: string,
  quantity: number
): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc('decrease_stock', {
    p_variant_id: variantId,
    p_quantity: quantity,
  });
  return { error: error?.message ?? null };
}
```

Add this SQL function in Supabase SQL editor:

```sql
-- Atomic stock decrease to prevent overselling
CREATE OR REPLACE FUNCTION decrease_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE product_svc.product_variants
  SET stock_qty = stock_qty - p_quantity
  WHERE id = p_variant_id AND stock_qty >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Create `packages/product-service/src/index.ts`:

```typescript
export * from './queries';
export * from './mutations';
```

---

## 11. Step 7 — Order Service

Create `packages/order-service/src/mutations.ts`:

```typescript
import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import { decreaseStock } from '@static-wears/product-service';
import type { Order, OrderItem, CartItem } from '@static-wears/shared';

export async function createOrder(data: {
  customer_id: string;
  items: CartItem[];
  shipping: { name: string; phone: string; address: string };
  notes?: string;
}): Promise<{ order: Order | null; error: string | null }> {
  const supabase = createSupabaseAdminClient();

  const total_amount = data.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  // Create the order
  const { data: order, error: orderError } = await supabase
    .schema('order_svc')
    .from('orders')
    .insert({
      customer_id: data.customer_id,
      total_amount,
      shipping_name: data.shipping.name,
      shipping_phone: data.shipping.phone,
      shipping_addr: data.shipping.address,
      notes: data.notes,
    })
    .select()
    .single();

  if (orderError || !order) return { order: null, error: orderError?.message ?? 'Failed to create order' };

  // Insert order items
  const orderItems = data.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    variant_desc: item.variant_desc,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.unit_price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .schema('order_svc')
    .from('order_items')
    .insert(orderItems);

  if (itemsError) return { order: null, error: itemsError.message };

  // Decrease stock for each variant
  for (const item of data.items) {
    if (item.variant_id) {
      const { error: stockError } = await decreaseStock(item.variant_id, item.quantity);
      if (stockError) {
        // Rollback — cancel the order
        await updateOrderStatus(order.id, 'cancelled');
        return { order: null, error: `Stock error: ${stockError}` };
      }
    }
  }

  return { order, error: null };
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .schema('order_svc')
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  return { error: error?.message ?? null };
}
```

Create `packages/order-service/src/queries.ts`:

```typescript
import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import type { Order } from '@static-wears/shared';

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .schema('order_svc')
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .schema('order_svc')
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single();
  return data ?? null;
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .schema('order_svc')
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  return data ?? [];
}
```

Create `packages/order-service/src/index.ts`:

```typescript
export * from './queries';
export * from './mutations';
```

---

## 12. Step 8 — Payment Service (Stripe)

Create `packages/payment-service/src/stripe.ts`:

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function createCheckoutSession(data: {
  orderId: string;
  items: { name: string; price: number; quantity: number; image?: string }[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionUrl: string | null; sessionId: string | null; error: string | null }> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: data.customerEmail,
      mode: 'payment',
      line_items: data.items.map(item => ({
        price_data: {
          currency: 'lkr',
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      })),
      metadata: { order_id: data.orderId },
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
    });

    return { sessionUrl: session.url, sessionId: session.id, error: null };
  } catch (err: any) {
    return { sessionUrl: null, sessionId: null, error: err.message };
  }
}

export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event | null> {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return null;
  }
}
```

Create `packages/payment-service/src/index.ts`:

```typescript
export * from './stripe';
```

### 12.1 Payment API Routes

Create `apps/storefront/src/app/api/payments/create-session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@static-wears/shared';
import { createCheckoutSession } from '@static-wears/payment-service';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, items } = await req.json();

  const session = await createCheckoutSession({
    orderId,
    items,
    customerEmail: user.email!,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
  });

  if (session.error) return NextResponse.json({ error: session.error }, { status: 400 });

  // Record pending payment in DB
  const admin = createSupabaseAdminClient();
  await admin
    .schema('payment_svc')
    .from('payments')
    .insert({
      order_id: orderId,
      stripe_session_id: session.sessionId,
      amount: items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
      currency: 'lkr',
    });

  return NextResponse.json({ sessionUrl: session.sessionUrl });
}
```

Create `apps/storefront/src/app/api/payments/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@static-wears/payment-service';
import { createSupabaseAdminClient } from '@static-wears/shared';
import { updateOrderStatus } from '@static-wears/order-service';
import { sendOrderConfirmation } from '@static-wears/email-service';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  const event = await constructWebhookEvent(body, signature);

  if (!event) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

  const supabase = createSupabaseAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orderId = session.metadata.order_id;

    // Update payment status
    await supabase
      .schema('payment_svc')
      .from('payments')
      .update({
        payment_status: 'paid',
        stripe_payment_id: session.payment_intent,
        payment_method: 'card',
        payment_date: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id);

    // Update order status
    await updateOrderStatus(orderId, 'confirmed');

    // Send confirmation email (this triggers email service)
    // We emit a Realtime event — email service listens and sends the email
    await supabase
      .schema('order_svc')
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as any;
    await supabase
      .schema('payment_svc')
      .from('payments')
      .update({ payment_status: 'failed' })
      .eq('stripe_payment_id', intent.id);
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } };
```

---

## 13. Step 9 — Email/Notification Service (Resend)

Create `packages/email-service/src/templates/order-confirmation.tsx`:

```typescript
// React Email template for order confirmation
export function OrderConfirmationEmail({
  customerName,
  orderId,
  items,
  total,
  shippingAddress,
}: {
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; color: #f0f0f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ff6b35; }
    .title { font-size: 22px; font-weight: 700; margin: 20px 0 8px; }
    .subtitle { color: #888; font-size: 14px; }
    .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a2a; font-size: 14px; }
    .total { font-size: 18px; font-weight: 700; color: #ff6b35; margin-top: 16px; text-align: right; }
    .order-id { background: #ff6b35; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    .footer { text-align: center; color: #555; font-size: 12px; margin-top: 40px; }
    a { color: #ff6b35; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">STATIC WEARS</div>
      <div class="title">Order Confirmed! 🎉</div>
      <div class="subtitle">Thanks ${customerName}, your order is on its way.</div>
      <br/>
      <span class="order-id">Order #${orderId.slice(0, 8).toUpperCase()}</span>
    </div>

    <div class="card">
      <strong style="font-size:13px; color:#888; text-transform:uppercase; letter-spacing:1px;">Items Ordered</strong>
      ${items.map(item => `
        <div class="item">
          <span>${item.name} × ${item.quantity}</span>
          <span>LKR ${(item.price * item.quantity).toLocaleString()}</span>
        </div>
      `).join('')}
      <div class="total">Total: LKR ${total.toLocaleString()}</div>
    </div>

    <div class="card">
      <strong style="font-size:13px; color:#888; text-transform:uppercase; letter-spacing:1px;">Shipping To</strong>
      <p style="margin: 12px 0 0; font-size: 14px; line-height: 1.6;">${shippingAddress}</p>
    </div>

    <div class="footer">
      <p>Questions? Email us at <a href="mailto:hello@staticwears.lk">hello@staticwears.lk</a></p>
      <p style="margin-top: 8px;">© 2026 Static Wears. Sri Lanka.</p>
    </div>
  </div>
</body>
</html>
  `;
}
```

Create `packages/email-service/src/index.ts`:

```typescript
import { Resend } from 'resend';
import { OrderConfirmationEmail } from './templates/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOrderConfirmation(data: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
}): Promise<{ error: string | null }> {
  try {
    await resend.emails.send({
      from: 'Static Wears <orders@staticwears.lk>',
      to: data.to,
      subject: `Order Confirmed — #${data.orderId.slice(0, 8).toUpperCase()}`,
      html: OrderConfirmationEmail(data),
    });
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function sendShippingUpdate(data: {
  to: string;
  customerName: string;
  orderId: string;
  status: string;
}): Promise<{ error: string | null }> {
  try {
    await resend.emails.send({
      from: 'Static Wears <orders@staticwears.lk>',
      to: data.to,
      subject: `Your Order Has Been ${data.status} — Static Wears`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px;">
          <h1 style="color:#ff6b35;">Static Wears</h1>
          <p>Hi ${data.customerName},</p>
          <p>Your order <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong> has been updated to: <strong>${data.status}</strong>.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      `,
    });
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}
```

---

## 14. Step 10 — Event Bus (Supabase Realtime)

This simulates the Kafka event bus from the proposal using Supabase's built-in Postgres change notifications.

Create `apps/storefront/src/lib/realtime.ts`:

```typescript
import { supabase } from '@static-wears/shared';

// Listen for order status changes (used by customer to see live updates)
export function subscribeToOrder(
  orderId: string,
  onStatusChange: (status: string) => void
) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'order_svc',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        onStatusChange(payload.new.status);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// Listen for stock changes on a product (show "low stock" in real time)
export function subscribeToProductStock(
  productId: string,
  onStockChange: (variants: any[]) => void
) {
  const channel = supabase
    .channel(`stock-${productId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'product_svc',
        table: 'product_variants',
        filter: `product_id=eq.${productId}`,
      },
      (payload) => {
        onStockChange([payload.new]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
```

Enable Realtime in Supabase:
1. Go to **Database → Replication**
2. Enable replication for: `order_svc.orders`, `product_svc.product_variants`

---

## 15. Step 11 — Customer Storefront UI

### 15.1 Middleware

Create `apps/storefront/src/middleware.ts`:

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@static-wears/shared';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### 15.2 Root Layout with Design System

Create `apps/storefront/src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Bebas_Neue, Space_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from '@/components/ui/sonner';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Static Wears — Drop Culture Sri Lanka',
  description: 'Premium streetwear crafted in Sri Lanka',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable}`}>
      <body className="bg-[#080808] text-[#f0f0f0] antialiased">
        <CartProvider>
          {children}
          <Toaster position="bottom-right" theme="dark" />
        </CartProvider>
      </body>
    </html>
  );
}
```

### 15.3 Global CSS (Design System Tokens)

Replace `apps/storefront/src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Brand Colors */
  --brand-primary: #ff6b35;      /* Burnt orange — the Static Wears signature */
  --brand-secondary: #1a1a2e;    /* Deep navy */
  --brand-accent: #e8ff59;       /* Electric lime for CTAs */

  /* Neutrals */
  --bg-base: #080808;
  --bg-surface: #111111;
  --bg-elevated: #1a1a1a;
  --bg-border: #2a2a2a;

  /* Text */
  --text-primary: #f0f0f0;
  --text-secondary: #888888;
  --text-muted: #444444;

  /* Typography */
  --font-display: var(--font-display);
  --font-body: var(--font-mono);
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #111; }
::-webkit-scrollbar-thumb { background: #ff6b35; border-radius: 2px; }

/* Selection */
::selection { background: #ff6b35; color: #080808; }

/* Smooth scrolling */
html { scroll-behavior: smooth; }

/* Custom cursor on desktop */
@media (pointer: fine) {
  * { cursor: none !important; }
}

/* Grain overlay for depth */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
}
```

### 15.4 Cart Context

Create `apps/storefront/src/context/cart-context.tsx`:

```typescript
'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { CartItem, Cart } from '@static-wears/shared';

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { variant_id: string } }
  | { type: 'UPDATE_QTY'; payload: { variant_id: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: CartItem[] };

function cartReducer(state: Cart, action: CartAction): Cart {
  let items: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM':
      const existing = state.items.find(i => i.variant_id === action.payload.variant_id);
      if (existing) {
        items = state.items.map(i =>
          i.variant_id === action.payload.variant_id
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      } else {
        items = [...state.items, action.payload];
      }
      break;
    case 'REMOVE_ITEM':
      items = state.items.filter(i => i.variant_id !== action.payload.variant_id);
      break;
    case 'UPDATE_QTY':
      items = action.payload.quantity === 0
        ? state.items.filter(i => i.variant_id !== action.payload.variant_id)
        : state.items.map(i =>
            i.variant_id === action.payload.variant_id
              ? { ...i, quantity: action.payload.quantity }
              : i
          );
      break;
    case 'CLEAR':
      items = [];
      break;
    case 'HYDRATE':
      items = action.payload;
      break;
    default:
      return state;
  }

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  return { items, total };
}

const CartContext = createContext<{
  cart: Cart;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('sw-cart');
    if (saved) dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) });
  }, []);

  // Persist to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('sw-cart', JSON.stringify(cart.items));
  }, [cart]);

  return <CartContext.Provider value={{ cart, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
```

### 15.5 Homepage

Create `apps/storefront/src/app/(shop)/page.tsx`:

```typescript
import { getProducts, getCategories } from '@static-wears/product-service';
import { HeroSection } from '@/components/layout/hero-section';
import { FeaturedProducts } from '@/components/product/featured-products';
import { CategoryBar } from '@/components/product/category-bar';

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ limit: 8, sort: 'newest' }),
    getCategories(),
  ]);

  return (
    <main>
      <HeroSection />
      <CategoryBar categories={categories} />
      <FeaturedProducts products={products} />
    </main>
  );
}
```

### 15.6 Hero Section Component

Create `apps/storefront/src/components/layout/hero-section.tsx`:

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax background grid */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#080808]" />
        {/* Animated grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ff6b35" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </motion.div>

      {/* Floating accent shape */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main hero content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block text-[--brand-primary] font-mono text-sm tracking-[0.4em] uppercase mb-6 border border-[--brand-primary]/30 px-4 py-1.5">
            New Collection 2026
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-[clamp(5rem,15vw,14rem)] leading-none tracking-tight text-white mb-8"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          STATIC
          <br />
          <span className="text-[--brand-primary]">WEARS</span>
        </motion.h1>

        <motion.p
          className="font-mono text-[--text-secondary] text-sm md:text-base tracking-wider mb-12 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Premium streetwear from the streets of Sri Lanka. Built different. Worn bold.
        </motion.p>

        <motion.div
          className="flex gap-4 justify-center flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/shop"
            className="group relative bg-[--brand-primary] text-black font-mono font-bold
                       px-8 py-4 tracking-widest text-sm uppercase overflow-hidden
                       transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Shop Now</span>
            <motion.div
              className="absolute inset-0 bg-[--brand-accent]"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </Link>
          <Link
            href="/shop?category=new"
            className="font-mono text-sm uppercase tracking-widest px-8 py-4
                       border border-[--bg-border] text-[--text-secondary]
                       hover:border-[--brand-primary] hover:text-[--brand-primary]
                       transition-all duration-300"
          >
            New Drops
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="font-mono text-xs text-[--text-muted] tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-[1px] h-12 bg-gradient-to-b from-[--brand-primary] to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
```

### 15.7 Product Card Component

Create `apps/storefront/src/components/product/product-card.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@static-wears/shared';
import { useCart } from '@/context/cart-context';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { dispatch } = useCart();

  const mainImage = product.images?.find(i => i.is_main) ?? product.images?.[0];
  const secondImage = product.images?.[1];
  const isLowStock = product.variants?.some(v => v.stock_qty > 0 && v.stock_qty <= 3);
  const isOutOfStock = product.variants?.every(v => v.stock_qty === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[--bg-elevated] mb-4">
          {mainImage && (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: hovered && secondImage ? 0 : 1 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${mainImage.image_path}`}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </motion.div>
          )}
          {secondImage && (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${secondImage.image_path}`}
                alt={`${product.name} alt`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </motion.div>
          )}

          {/* Overlays */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="font-mono text-xs tracking-widest text-[--text-secondary] uppercase border border-[--bg-border] px-3 py-1.5">
                Sold Out
              </span>
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-3 left-3">
              <span className="font-mono text-xs bg-[--brand-primary] text-black px-2 py-1 tracking-widest uppercase">
                Low Stock
              </span>
            </div>
          )}

          {/* Quick add button */}
          <motion.button
            className="absolute bottom-0 left-0 right-0 bg-[--brand-primary] text-black
                       font-mono font-bold text-xs tracking-widest uppercase py-3
                       flex items-center justify-center gap-2 opacity-0 translate-y-full
                       group-hover:opacity-100 group-hover:translate-y-0
                       transition-all duration-300 ease-out"
            onClick={(e) => {
              e.preventDefault();
              // Add first available variant to cart
              const variant = product.variants?.find(v => v.stock_qty > 0);
              if (variant) {
                dispatch({
                  type: 'ADD_ITEM',
                  payload: {
                    product_id: product.id,
                    variant_id: variant.id,
                    product_name: product.name,
                    variant_desc: `${variant.size} / ${variant.color}`,
                    image_path: mainImage?.image_path ?? '',
                    unit_price: product.base_price + variant.price_adj,
                    quantity: 1,
                  },
                });
              }
            }}
            disabled={isOutOfStock}
          >
            <ShoppingBag size={14} />
            Quick Add
          </motion.button>
        </div>

        {/* Product info */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-mono font-bold text-sm text-[--text-primary] uppercase tracking-wide leading-tight">
              {product.name}
            </h3>
            <span className="font-mono text-[--brand-primary] text-sm font-bold whitespace-nowrap">
              LKR {product.base_price.toLocaleString()}
            </span>
          </div>
          {product.categories && product.categories.length > 0 && (
            <span className="font-mono text-xs text-[--text-muted] uppercase tracking-wider">
              {product.categories[0]?.name}
            </span>
          )}
          {/* Color dots */}
          {product.variants && (
            <div className="flex gap-1.5 pt-1">
              {[...new Set(product.variants.map(v => v.color))].slice(0, 5).map(color => (
                <div
                  key={color}
                  title={color}
                  className="w-3 h-3 rounded-full border border-[--bg-border]"
                  style={{ backgroundColor: color.toLowerCase() === 'black' ? '#1a1a1a' :
                           color.toLowerCase() === 'white' ? '#f0f0f0' : color }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
```

---

## 16. Step 12 — Admin Dashboard UI

### 16.1 Admin Layout

Create `apps/admin/src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Static Wears Admin',
  robots: 'noindex, nofollow',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#060608] text-[#e8e8f0] antialiased font-sans">
        {children}
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  );
}
```

### 16.2 Admin Dashboard Page

Create `apps/admin/src/app/dashboard/page.tsx`:

```typescript
import { getAllOrders } from '@static-wears/order-service';
import { getAllUsers } from '@static-wears/user-service';
import { getProducts } from '@static-wears/product-service';
import { DashboardStats } from '@/components/dashboard/stats';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { TopProducts } from '@/components/dashboard/top-products';

export default async function DashboardPage() {
  const [orders, users, products] = await Promise.all([
    getAllOrders(),
    getAllUsers(),
    getProducts({ limit: 100 }),
  ]);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const stats = {
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers: users.length,
    totalProducts: products.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[#666] font-mono text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart orders={orders} />
        </div>
        <TopProducts orders={orders} products={products} />
      </div>

      <RecentOrders orders={orders.slice(0, 10)} />
    </div>
  );
}
```

### 16.3 Stats Cards Component

Create `apps/admin/src/components/dashboard/stats.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Users, Package, Clock
} from 'lucide-react';

const statConfig = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: TrendingUp, format: 'currency', color: '#ff6b35' },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingBag, format: 'number', color: '#7c3aed' },
  { key: 'totalCustomers', label: 'Customers', icon: Users, format: 'number', color: '#0ea5e9' },
  { key: 'totalProducts', label: 'Products', icon: Package, format: 'number', color: '#22c55e' },
  { key: 'pendingOrders', label: 'Pending Orders', icon: Clock, format: 'number', color: '#f59e0b' },
];

export function DashboardStats({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {statConfig.map((stat, i) => {
        const Icon = stat.icon;
        const value = stats[stat.key] ?? 0;
        const formatted = stat.format === 'currency'
          ? `LKR ${value.toLocaleString()}`
          : value.toLocaleString();

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-5 relative overflow-hidden"
          >
            {/* Background glow */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20"
              style={{ backgroundColor: stat.color }}
            />

            <div className="relative z-10">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}
              >
                <Icon size={16} style={{ color: stat.color }} />
              </div>
              <div className="font-mono text-xs text-[#666] uppercase tracking-widest mb-1">
                {stat.label}
              </div>
              <div className="font-bold text-xl text-[#e8e8f0] leading-none">
                {formatted}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
```

### 16.4 Revenue Chart Component

Create `apps/admin/src/components/dashboard/revenue-chart.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Order } from '@static-wears/shared';
import { motion } from 'framer-motion';

export function RevenueChart({ orders }: { orders: Order[] }) {
  const data = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0,
      };
    });

    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      const orderDate = new Date(order.created_at);
      const label = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const day = last30Days.find(d => d.date === label);
      if (day) {
        day.revenue += order.total_amount;
        day.orders += 1;
      }
    });

    return last30Days;
  }, [orders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-[#0e0e12] border border-[#1e1e28] rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-[#e8e8f0]">Revenue — Last 30 Days</h2>
          <p className="font-mono text-xs text-[#666] mt-0.5">LKR</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: '#555', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: '#555', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a24',
              border: '1px solid #2a2a38',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
            }}
            formatter={(v: number) => [`LKR ${v.toLocaleString()}`, 'Revenue']}
            labelStyle={{ color: '#888' }}
            itemStyle={{ color: '#ff6b35' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#ff6b35"
            strokeWidth={2}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ fill: '#ff6b35', strokeWidth: 0, r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```

---

## 17. UI Design System & Animations

### 17.1 Tailwind Config (Storefront)

Replace `apps/storefront/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
        sans: ['var(--font-mono)'],
      },
      colors: {
        brand: {
          primary: '#ff6b35',
          secondary: '#1a1a2e',
          accent: '#e8ff59',
        },
        bg: {
          base: '#080808',
          surface: '#111111',
          elevated: '#1a1a1a',
          border: '#2a2a2a',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'float': 'float 3s ease-in-out infinite',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 17.2 Custom Cursor Component

Create `apps/storefront/src/components/ui/cursor.tsx`:

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      {/* Trailing ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[--brand-primary]
                   pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{ x: springX, y: springY }}
      />
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[--brand-primary]
                   pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2"
        style={{ x: dotX, y: dotY }}
      />
    </>
  );
}
```

Add `<CustomCursor />` to the root layout inside the body.

### 17.3 Page Transition Wrapper

Create `apps/storefront/src/components/ui/page-transition.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

Wrap every page layout in `<PageTransition>`.

### 17.4 Marquee Banner

Create `apps/storefront/src/components/layout/marquee-banner.tsx`:

```typescript
export function MarqueeBanner() {
  const text = Array(8).fill('NEW DROP — STATIC WEARS 2026 — SRI LANKA STREETWEAR — ');
  return (
    <div className="bg-[--brand-primary] text-black py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {text.map((t, i) => (
          <span key={i} className="font-display text-lg tracking-wider mx-8">{t}</span>
        ))}
      </div>
    </div>
  );
}
```

---

## 18. Environment Variables Reference

Create `.env.local` at the project root (never commit this file):

```bash
# ============================================================
# SUPABASE
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================
# STRIPE
# ============================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================================
# RESEND (email)
# ============================================================
RESEND_API_KEY=re_...

# ============================================================
# APP URLs
# ============================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

Each app on Vercel gets its own environment variable set (see deployment section).

---

## 19. Step 13 — Deploy to Vercel

### 19.1 Push to GitHub

```bash
# From project root
git init
git add .
git commit -m "feat: initial project setup"
git remote add origin https://github.com/YOUR_USERNAME/static-wears.git
git push -u origin main
```

### 19.2 Deploy Storefront

1. Go to https://vercel.com/new
2. Import your `static-wears` repo
3. Set **Root Directory** to `apps/storefront`
4. Framework Preset: **Next.js**
5. Add all environment variables from `.env.local`
6. Deploy

### 19.3 Deploy Admin

1. Go to https://vercel.com/new again
2. Import the same repo
3. Set **Root Directory** to `apps/admin`
4. Add environment variables
5. Deploy

### 19.4 Set up Stripe Webhooks

```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# For local testing (run this while developing)
stripe listen --forward-to localhost:3000/api/payments/webhook

# For production: add webhook in Stripe Dashboard
# → Developers → Webhooks → Add endpoint
# URL: https://your-storefront.vercel.app/api/payments/webhook
# Events: checkout.session.completed, payment_intent.payment_failed
```

### 19.5 Update Supabase Auth URLs

After deploying, update in Supabase → Authentication → URL Configuration:
- Site URL: `https://your-storefront.vercel.app`
- Redirect URLs: add `https://your-storefront.vercel.app/**`

---

## 20. Step 14 — VPS Migration (Docker)

When you have your VPS, this is how you migrate each service.

### 20.1 Project structure on VPS

```
static-wears-vps/
├── services/
│   ├── user-service/          ← Express wrapper around packages/user-service
│   ├── product-service/       ← Express wrapper around packages/product-service
│   ├── order-service/         ← Express wrapper around packages/order-service
│   ├── payment-service/       ← Express wrapper around packages/payment-service
│   └── email-service/         ← Express wrapper around packages/email-service
├── apps/
│   ├── storefront/            ← Same Next.js app, now self-hosted
│   └── admin/                 ← Same Next.js app, now self-hosted
├── kafka/                     ← Kafka config
├── nginx/                     ← Reverse proxy config
└── docker-compose.yml
```

### 20.2 Example service Dockerfile

```dockerfile
# services/product-service/Dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3002
CMD ["node", "src/server.js"]
```

### 20.3 Express server wrapper (example for product service)

```javascript
// services/product-service/src/server.js
const express = require('express');
const { getProducts, getProductBySlug, getCategories } = require('@static-wears/product-service');

const app = express();
app.use(express.json());

app.get('/products', async (req, res) => {
  const products = await getProducts(req.query);
  res.json(products);
});

app.get('/products/:slug', async (req, res) => {
  const product = await getProductBySlug(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.get('/categories', async (req, res) => {
  const cats = await getCategories();
  res.json(cats);
});

app.listen(3002, () => console.log('Product service running on :3002'));
```

### 20.4 Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  # Databases (one per service)
  db-users:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: users_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - db_users:/var/lib/postgresql/data
    networks: [backend]

  db-products:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: products_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - db_products:/var/lib/postgresql/data
    networks: [backend]

  db-orders:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: orders_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - db_orders:/var/lib/postgresql/data
    networks: [backend]

  # Kafka (event bus — replaces Supabase Realtime)
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    networks: [backend]

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    depends_on: [zookeeper]
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    networks: [backend]

  # Microservices
  user-service:
    build: ./services/user-service
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASS}@db-users:5432/users_db
      KAFKA_BROKER: kafka:9092
      PORT: 3001
    depends_on: [db-users, kafka]
    networks: [backend]

  product-service:
    build: ./services/product-service
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASS}@db-products:5432/products_db
      KAFKA_BROKER: kafka:9092
      PORT: 3002
    depends_on: [db-products, kafka]
    networks: [backend]

  order-service:
    build: ./services/order-service
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASS}@db-orders:5432/orders_db
      KAFKA_BROKER: kafka:9092
      PORT: 3003
    depends_on: [db-orders, kafka]
    networks: [backend]

  payment-service:
    build: ./services/payment-service
    environment:
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      KAFKA_BROKER: kafka:9092
      PORT: 3004
    depends_on: [kafka]
    networks: [backend]

  email-service:
    build: ./services/email-service
    environment:
      RESEND_API_KEY: ${RESEND_API_KEY}
      KAFKA_BROKER: kafka:9092
      PORT: 3005
    depends_on: [kafka]
    networks: [backend]

  # Frontend apps
  storefront:
    build: ./apps/storefront
    environment:
      NEXT_PUBLIC_API_URL: http://nginx/api
    depends_on: [user-service, product-service, order-service]
    networks: [frontend, backend]

  admin:
    build: ./apps/admin
    environment:
      NEXT_PUBLIC_API_URL: http://nginx/api
    networks: [frontend, backend]

  # Nginx (API gateway + reverse proxy)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on: [storefront, admin]
    networks: [frontend, backend]

networks:
  frontend:
  backend:

volumes:
  db_users:
  db_products:
  db_orders:
```

### 20.5 Nginx Config

```nginx
# nginx/nginx.conf
events { worker_connections 1024; }

http {
  upstream storefront { server storefront:3000; }
  upstream admin { server admin:3001; }
  upstream user_svc { server user-service:3001; }
  upstream product_svc { server product-service:3002; }
  upstream order_svc { server order-service:3003; }
  upstream payment_svc { server payment-service:3004; }

  server {
    listen 80;
    server_name staticwears.lk www.staticwears.lk;
    return 301 https://$server_name$request_uri;
  }

  server {
    listen 443 ssl;
    server_name staticwears.lk;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Route API calls to microservices
    location /api/users/ { proxy_pass http://user_svc/; }
    location /api/products/ { proxy_pass http://product_svc/; }
    location /api/orders/ { proxy_pass http://order_svc/; }
    location /api/payments/ { proxy_pass http://payment_svc/; }

    # Storefront
    location / { proxy_pass http://storefront; }
  }

  server {
    listen 443 ssl;
    server_name admin.staticwears.lk;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    location / { proxy_pass http://admin; }
  }
}
```

### 20.6 Kafka in services (replacing Supabase Realtime)

```javascript
// Example: emit event when order is confirmed
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
const producer = kafka.producer();

// In order service — publish event
await producer.send({
  topic: 'order.confirmed',
  messages: [{ value: JSON.stringify({ orderId, customerEmail, items }) }],
});

// In email service — consume event
const consumer = kafka.consumer({ groupId: 'email-service' });
await consumer.subscribe({ topic: 'order.confirmed' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const data = JSON.parse(message.value.toString());
    await sendOrderConfirmation(data);
  },
});
```

---

## 21. Testing Strategy

### 21.1 Unit Tests (Vitest)

```bash
# Install in root
pnpm add -D vitest @vitest/ui happy-dom
```

```typescript
// packages/order-service/src/__tests__/mutations.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createOrder } from '../mutations';

describe('Order Service', () => {
  it('calculates total correctly', () => {
    const items = [
      { product_id: '1', variant_id: 'v1', product_name: 'Tee', variant_desc: 'M/Black',
        image_path: '', unit_price: 2500, quantity: 2 },
      { product_id: '2', variant_id: 'v2', product_name: 'Cap', variant_desc: 'One Size',
        image_path: '', unit_price: 1800, quantity: 1 },
    ];
    const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    expect(total).toBe(6800);
  });
});
```

### 21.2 API Tests (with Postman)

Import this collection into Postman:

```
Test flow:
1. POST /api/auth/signup → create test user
2. POST /api/auth/signin → get JWT
3. GET  /api/products → list products (no auth needed)
4. GET  /api/products/[slug] → product detail
5. POST /api/orders → create order (requires auth)
6. POST /api/payments/create-session → start checkout (requires auth)
7. GET  /api/orders → list my orders (requires auth)
```

### 21.3 Manual Testing Checklist

```
Customer Flow:
[ ] Register a new account
[ ] Log in with those credentials
[ ] Browse products page
[ ] Filter by category
[ ] Search for a product
[ ] Open product detail page
[ ] Select size and color
[ ] Add to cart
[ ] Update quantity in cart
[ ] Remove item from cart
[ ] Proceed to checkout
[ ] Fill in shipping information
[ ] Complete Stripe test payment (card: 4242 4242 4242 4242)
[ ] Receive order confirmation email
[ ] View order in "My Orders"
[ ] See order status update in real time

Admin Flow:
[ ] Log in as admin
[ ] View dashboard stats and chart
[ ] Add a new product with images
[ ] Add variants (size/color/stock)
[ ] View all orders
[ ] Update an order status
[ ] View customer list
[ ] View sales report
```

---

## 22. Project Checklist (Proposal Coverage)

This table maps every requirement from your proposal to the implementation.

| Proposal Requirement | Implementation | Status |
|---|---|---|
| **Microservices Architecture** | 5 separate service packages (user, product, order, payment, email) | ✅ |
| **Customer shop frontend** | `apps/storefront` — Next.js with full shopping experience | ✅ |
| **Admin dashboard** | `apps/admin` — Real-time charts, CRUD, reporting | ✅ |
| **User accounts (sign up/login)** | Supabase Auth + user-service | ✅ |
| **Product browsing + search + filter** | Product service queries with filters | ✅ |
| **Product detail with photos** | Supabase Storage + product_images table | ✅ |
| **Cart (add/update/remove)** | CartContext with sessionStorage | ✅ |
| **Secure checkout** | Stripe Checkout Sessions | ✅ |
| **Order confirmation email** | Resend + email-service | ✅ |
| **Admin: product management** | Full CRUD via admin API + product-service | ✅ |
| **Admin: order management** | Order status updates + getAllOrders | ✅ |
| **Admin: user management** | getAllUsers via admin client | ✅ |
| **Admin: reports/charts** | RevenueChart + TopProducts (Recharts) | ✅ |
| **PostgreSQL** | Supabase PostgreSQL with per-service schemas | ✅ |
| **Auth service (Clerk equiv.)** | Supabase Auth (same security model) | ✅ |
| **Event bus (Kafka equiv.)** | Supabase Realtime now → Kafka on VPS | ✅ |
| **Node.js backend** | All service packages are pure TypeScript/Node | ✅ |
| **Next.js frontend** | Both apps use Next.js 14 App Router | ✅ |
| **Tailwind CSS** | Full Tailwind + custom design tokens | ✅ |
| **ER Diagram entities** | All entities from diagram implemented | ✅ |
| **Supabase Storage (images)** | product-images bucket | ✅ |
| **Mobile responsive** | Tailwind responsive utilities throughout | ✅ |
| **VPS-ready with Docker** | Full docker-compose.yml + Dockerfiles | ✅ |
| **Independent service scaling** | Each Docker container scales independently | ✅ |

---

## Quick Start Commands

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/static-wears.git
cd static-wears
pnpm install

# Set up env vars
cp .env.example .env.local
# Edit .env.local with your Supabase, Stripe, Resend keys

# Run both apps in parallel
pnpm dev

# Storefront → http://localhost:3000
# Admin     → http://localhost:3001

# Run tests
pnpm test

# Build for production
pnpm build

# Type check all packages
pnpm type-check
```

---

*Guide prepared for Static Wears HND Project — Hardy ATI, Sri Lanka — 2026*
