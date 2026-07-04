# Static Wears — Full Technical Documentation

> **HND Final Project** — Full-stack microservices e-commerce platform  
> Built by Chamidu Jayaneththi | Hardy ATI Sri Lanka

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Repository Structure](#4-repository-structure)
5. [Database Schema](#5-database-schema)
6. [Microservices Breakdown](#6-microservices-breakdown)
7. [API Reference](#7-api-reference)
8. [Shared Packages](#8-shared-packages)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Payment Integrations](#10-payment-integrations)
11. [Email System](#11-email-system)
12. [Kafka Event Bus](#12-kafka-event-bus)
13. [File Storage](#13-file-storage)
14. [Infrastructure & Deployment](#14-infrastructure--deployment)
15. [Environment Variables](#15-environment-variables)
16. [Frontend — Storefront](#16-frontend--storefront)
17. [Frontend — Admin Panel](#17-frontend--admin-panel)
18. [Local Development Setup](#18-local-development-setup)
19. [CI/CD Pipeline](#19-cicd-pipeline)

---

## 1. Project Overview

Static Wears is a full **microservices e-commerce platform** built for a Sri Lankan streetwear brand. It is designed around a **drop culture** model — limited-edition product releases with real-time inventory management.

### What the platform does

| Feature | Description |
|---|---|
| Product Catalog | Products with multiple colour/size variants, image galleries |
| Cart & Checkout | Full cart with multi-step checkout flow |
| Payments | Stripe (card), PayPal, PayHere (local LKR gateway) |
| Order Management | End-to-end order lifecycle from pending → delivered |
| Email Notifications | Order confirmation, shipping updates, low stock admin alerts |
| Admin Panel | Full CRUD for products, orders, users, banners, categories, brands |
| Image Management | Self-hosted Supabase Storage with imgproxy transformation |
| Mobile-First | Fully responsive storefront + admin with mobile bottom nav |

### Live URLs

| Service | URL |
|---|---|
| Storefront | https://staticwears.com |
| Admin Panel | https://admin.staticwears.com |
| Supabase API | https://api.staticwears.com |

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Internet / Users                            │
└───────────┬─────────────────┬───────────────────────────────────────┘
            │                 │
     staticwears.com    admin.staticwears.com
            │                 │
┌───────────▼─────────────────▼───────────────────────────────────────┐
│                        NGINX (Reverse Proxy)                        │
│              SSL Termination  |  HTTP → HTTPS redirect              │
└───────────┬─────────────────┬───────────────────┬───────────────────┘
            │                 │                   │
     ┌──────▼──────┐  ┌───────▼──────┐   ┌───────▼──────────┐
     │  STOREFRONT │  │    ADMIN     │   │  api.staticwears  │
     │  Next.js    │  │  Next.js     │   │  (Kong Gateway)   │
     │  :3000      │  │  :3001       │   │  :8000            │
     └──────┬──────┘  └───────┬──────┘   └───────┬──────────┘
            │                 │                   │
            │    ┌────────────┘          ┌────────┴──────────┐
            │    │                       │                   │
            ▼    ▼                       ▼                   ▼
     ┌─────────────────┐      ┌──────────────┐   ┌──────────────────┐
     │  Apache Kafka   │      │  PostgreSQL  │   │  Supabase Stack  │
     │  :9092 (KRaft)  │      │  :5432       │   │  Auth (GoTrue)   │
     └────────┬────────┘      │  (Supabase   │   │  Storage API     │
              │               │   managed)   │   │  PostgREST       │
     ┌────────▼────────┐      └──────────────┘   │  imgproxy        │
     │  email-worker   │                          └──────────────────┘
     │  (Node.js)      │
     └────────┬────────┘
              │
     ┌────────▼────────┐
     │   Resend API    │
     │  (Email SaaS)   │
     └─────────────────┘
```

### Request Flow — Customer Places Order

```
Customer Browser
      │
      │  1. POST /api/orders
      ▼
  Storefront (Next.js API Route)
      │
      │  2. createOrder() — inserts to DB, decreases stock
      ▼
  PostgreSQL (via Supabase/Kong)
      │
      │  3. publishEvent(ORDER_PLACED)
      ▼
  Apache Kafka (order.placed topic)
      │
      │  4. Consumer picks up event
      ▼
  email-worker (Node.js consumer)
      │
      │  5. sendOrderConfirmation()
      ▼
  Resend API → Customer's Email ✓
```

### Request Flow — Admin Updates Order Status

```
Admin Browser
      │
      │  1. PATCH /api/admin/orders/:id
      ▼
  Admin (Next.js API Route)
      │  requireAdmin() checks Clerk JWT
      │
      │  2. updateOrderStatus() + lookupCustomerEmail()
      ▼
  PostgreSQL + Clerk API
      │
      │  3. publishEvent(ORDER_STATUS_CHANGED)
      ▼
  Apache Kafka (order.status.changed topic)
      │
      │  4. Consumer picks up event
      ▼
  email-worker → sendShippingUpdate()
      │
      ▼
  Resend API → Customer's Email ✓
```

### Docker Network Topology

```
┌─────────────── staticwears-net (bridge) ───────────────────────────┐
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │storefront│  │  admin   │  │  email-  │  │     nginx        │   │
│  │  :3000   │  │  :3001   │  │  worker  │  │  :80 :443        │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │             │                  │             │
│       └──────────────┴─────────────┘                 │             │
│                      │                               │             │
│              ┌───────▼──────┐                        │             │
│              │    kafka     │                        │             │
│              │    :9092     │                        │             │
│              └──────────────┘                        │             │
│                                                      │             │
│  ┌──────────────────────────────────────────────┐   │             │
│  │              Supabase Stack                  │◄──┘             │
│  │  kong:8000  db:5432  auth  rest  storage     │                 │
│  │  imgproxy:5001                               │                 │
│  └──────────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

> **Key networking rule:** Server-side code uses `http://kong:8000` (internal Docker DNS) to reach Supabase. Browser-facing code uses `https://api.staticwears.com`. The `SUPABASE_INTERNAL_URL` env var handles this switch automatically.

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.6 | React framework (App Router, Turbopack) |
| React | 18.3.x | UI library |
| Tailwind CSS | 3.4.x | Utility-first styling |
| Clerk | 6.9.x | Authentication & user management |
| Sonner | 1.7.x | Toast notifications |
| Lucide React | 0.446.x | Icon library |
| Recharts | 2.13.x | Admin dashboard charts |

### Backend / Infrastructure
| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 15.1 | Primary database |
| Supabase | Self-hosted | DB hosting + Auth + Storage + PostgREST |
| Apache Kafka | 3.7.1 | Async event bus (KRaft mode, no Zookeeper) |
| Kong | 2.8.1 | API gateway for Supabase services |
| Nginx | 1.25 | Reverse proxy + SSL termination |
| Docker | - | Containerisation |
| Node.js | 22 | Runtime for Next.js + email-worker |

### External Services
| Service | Purpose |
|---|---|
| Clerk | Authentication SaaS |
| Resend | Transactional email API |
| Stripe | Card payments |
| PayPal | PayPal wallet payments |
| PayHere | LKR local payment gateway |
| Let's Encrypt | Free SSL certificates |
| GitHub Actions | CI/CD auto-deploy |
| DigitalOcean | VPS hosting |

### Package Manager
- **pnpm 9** with workspaces (monorepo)

---

## 4. Repository Structure

```
StaticWears/                          ← Monorepo root
├── apps/
│   ├── storefront/                   ← Customer-facing Next.js app (port 3000)
│   │   ├── src/
│   │   │   ├── app/                  ← Next.js App Router pages + API routes
│   │   │   │   ├── (auth)/           ← Login + Register pages (route group)
│   │   │   │   ├── (shop)/           ← Storefront pages (route group)
│   │   │   │   ├── account/          ← User account page
│   │   │   │   ├── cart/             ← Cart page
│   │   │   │   ├── checkout/         ← Checkout flow
│   │   │   │   ├── orders/           ← Order history
│   │   │   │   └── api/              ← API routes
│   │   │   │       ├── orders/
│   │   │   │       ├── payments/
│   │   │   │       │   ├── create-session/   ← Stripe
│   │   │   │       │   ├── webhook/          ← Stripe webhook
│   │   │   │       │   ├── paypal/
│   │   │   │       │   └── payhere/
│   │   │   │       ├── products/
│   │   │   │       ├── settings/
│   │   │   │       └── users/
│   │   │   ├── components/           ← Reusable UI components
│   │   │   │   ├── layout/           ← Navbar, footer, bottom-nav
│   │   │   │   ├── product/          ← ProductCard, ProductGrid
│   │   │   │   └── ui/               ← Generic UI primitives
│   │   │   ├── context/              ← CartContext (React Context + localStorage)
│   │   │   ├── lib/                  ← Utility functions
│   │   │   └── proxy.ts              ← Clerk middleware (auth protection)
│   │   ├── next.config.mjs
│   │   └── .env.production           ← Production env (on VPS only)
│   │
│   └── admin/                        ← Admin panel Next.js app (port 3001)
│       ├── src/
│       │   ├── app/
│       │   │   ├── login/            ← Admin login page
│       │   │   ├── dashboard/        ← KPI dashboard
│       │   │   ├── products/         ← Product CRUD
│       │   │   ├── categories/       ← Category CRUD
│       │   │   ├── brands/           ← Brand CRUD
│       │   │   ├── orders/           ← Order management
│       │   │   ├── users/            ← Customer management
│       │   │   ├── banners/          ← Homepage banner management
│       │   │   ├── settings/         ← Site settings
│       │   │   └── api/admin/        ← Protected admin API routes
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── sidebar.tsx   ← Desktop sidebar navigation
│       │   │   │   ├── admin-shell.tsx ← Mobile-responsive shell
│       │   │   │   └── header.tsx
│       │   │   ├── products/
│       │   │   │   └── image-uploader.tsx
│       │   │   ├── dashboard/
│       │   │   │   └── revenue-chart.tsx
│       │   │   └── ui/
│       │   │       └── toggle.tsx    ← Reusable toggle component
│       │   ├── lib/
│       │   │   └── require-admin.ts  ← Admin auth guard
│       │   └── proxy.ts              ← Clerk middleware
│       └── next.config.mjs
│
├── packages/
│   ├── shared/                       ← Shared types + Supabase client factories
│   ├── product-service/              ← Product CRUD + queries
│   ├── order-service/                ← Order creation + queries
│   ├── user-service/                 ← User profile + addresses
│   ├── payment-service/              ← Stripe client + helpers
│   ├── email-service/                ← Resend email functions + HTML templates
│   └── kafka/                        ← Kafka producer, topics, types, email-worker
│
├── nginx/
│   └── nginx.conf                    ← Nginx virtual hosts + SSL config
│
├── supabase/
│   └── kong.yml                      ← Kong API gateway declarative config
│
├── .github/
│   └── workflows/
│       └── deploy.yml                ← GitHub Actions auto-deploy
│
├── docker-compose.yml                ← Full stack orchestration
├── Dockerfile.storefront
├── Dockerfile.admin
├── Dockerfile.email-worker
├── SUPABASE_SCHEMA.sql              ← Full database schema
└── pnpm-workspace.yaml
```

---

## 5. Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│    profiles     │         │  user_addresses  │
├─────────────────┤         ├─────────────────┤
│ id (PK, UUID)   │◄────────│ user_id (FK)    │
│ full_name       │   1:N   │ id (PK)         │
│ email (unique)  │         │ label           │
│ phone           │         │ address_line1   │
│ avatar_url      │         │ address_line2   │
│ role            │         │ city            │
│ created_at      │         │ district        │
│ updated_at      │         │ postal_code     │
└─────────────────┘         │ is_default      │
                            └─────────────────┘

┌─────────────┐    ┌──────────────────────┐    ┌──────────────────┐
│  categories │    │  product_categories  │    │   products       │
├─────────────┤    ├──────────────────────┤    ├──────────────────┤
│ id (PK)     │◄───│ category_id (FK)     │───►│ id (PK, UUID)   │
│ name        │N:M │ product_id (FK)      │M:N │ name             │
│ slug        │    └──────────────────────┘    │ slug (unique)    │
│ description │                                │ description      │
│ status      │    ┌──────────────────┐         │ base_price       │
└─────────────┘    │     brands       │         │ brand_id (FK)   │
                   ├──────────────────┤         │ status           │
                   │ id (PK)          │◄────────│ created_at       │
                   │ name             │  N:1    │ updated_at       │
                   │ slug             │         └──────┬───────────┘
                   │ description      │                │
                   └──────────────────┘         ┌──────┴──────────────┐
                                                │                     │
                                       ┌────────▼────────┐  ┌─────────▼──────┐
                                       │ product_variants │  │ product_images  │
                                       ├─────────────────┤  ├────────────────┤
                                       │ id (PK)          │  │ id (PK)         │
                                       │ product_id (FK)  │  │ product_id (FK) │
                                       │ size             │  │ image_path      │
                                       │ color            │  │ is_main         │
                                       │ stock_qty        │  │ sort_order      │
                                       │ price_adj        │  │ created_at      │
                                       │ sku (unique)     │  └────────────────┘
                                       │ description      │
                                       │ image_url        │
                                       └─────────┬────────┘
                                                 │
                              ┌──────────────────▼──────────────────────┐
                              │                orders                   │
                              ├─────────────────────────────────────────┤
                              │ id (PK, UUID)                           │
                              │ customer_id (no FK — allows user delete)│
                              │ status (pending/confirmed/processing/   │
                              │         shipped/delivered/cancelled)    │
                              │ total_amount                            │
                              │ shipping_name                           │
                              │ shipping_phone                          │
                              │ shipping_addr                           │
                              │ notes                                   │
                              │ created_at / updated_at                 │
                              └──────────────┬──────────────────────────┘
                                             │ 1:N
                              ┌──────────────▼──────────────────────────┐
                              │              order_items                │
                              ├─────────────────────────────────────────┤
                              │ id (PK)                                 │
                              │ order_id (FK, CASCADE)                  │
                              │ product_id (no FK — snapshot)           │
                              │ variant_id (no FK — snapshot)           │
                              │ product_name (denormalised snapshot)    │
                              │ variant_desc                            │
                              │ quantity                                │
                              │ unit_price                              │
                              │ subtotal                                │
                              └─────────────────────────────────────────┘

                              ┌────────────────────────────────────────┐
                              │               payments                 │
                              ├────────────────────────────────────────┤
                              │ id (PK)                                │
                              │ order_id (FK, unique — 1 per order)   │
                              │ stripe_payment_id (unique)             │
                              │ stripe_session_id (unique)             │
                              │ amount                                 │
                              │ currency (default: 'lkr')              │
                              │ payment_method (card/paypal/payhere)   │
                              │ payment_status (pending/paid/failed/   │
                              │                  refunded)             │
                              │ payment_date                           │
                              │ created_at                             │
                              └────────────────────────────────────────┘

                              ┌────────────────────────────────────────┐
                              │             site_settings              │
                              ├────────────────────────────────────────┤
                              │ key (PK, TEXT)                         │
                              │ value (TEXT/JSON)                      │
                              └────────────────────────────────────────┘
```

### Row Level Security (RLS) Summary

| Table | Customer can | Admin can |
|---|---|---|
| profiles | View & update own | View all |
| user_addresses | Full CRUD own | - |
| products | View active only | Full CRUD via service role |
| product_variants | View | Full CRUD via service role |
| product_images | View | Full CRUD via service role |
| categories | View active | Full CRUD via service role |
| brands | View | Full CRUD via service role |
| orders | View own (by customer_id) | View all |
| order_items | View own (via order) | View all |
| payments | View own (via order) | View all |

> All admin operations use the `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS entirely.

### Key PostgreSQL Functions

```sql
-- Atomic stock decrease — prevents overselling at DB level
CREATE OR REPLACE FUNCTION decrease_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS void AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_qty INTO current_stock
  FROM product_variants WHERE id = p_variant_id FOR UPDATE;
  
  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;
  
  UPDATE product_variants
  SET stock_qty = stock_qty - p_quantity
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Microservices Breakdown

### Service Map

```
┌────────────────────────────────────────────────────────────────┐
│                         SERVICES                               │
├──────────────┬─────────────────────────────────────────────────┤
│  storefront  │ Customer-facing Next.js app                     │
│              │ Pages: home, shop, product detail, cart,        │
│              │        checkout, orders, account, auth          │
│              │ API routes: /api/orders, /api/payments/*,       │
│              │             /api/products, /api/users/*         │
├──────────────┼─────────────────────────────────────────────────┤
│    admin     │ Internal Next.js app (admin-only)               │
│              │ Pages: dashboard, products, orders, users,      │
│              │        categories, brands, banners, settings    │
│              │ API routes: /api/admin/* (all require admin)    │
├──────────────┼─────────────────────────────────────────────────┤
│ email-worker │ Node.js Kafka consumer                          │
│              │ Listens to: order.placed, order.status.changed, │
│              │             stock.low                           │
│              │ Sends emails via Resend API                     │
├──────────────┼─────────────────────────────────────────────────┤
│    kafka     │ Apache Kafka 3.7.1 (KRaft, single broker)      │
│              │ Topics: order.placed, order.status.changed,     │
│              │         stock.low                               │
├──────────────┼─────────────────────────────────────────────────┤
│     db       │ PostgreSQL 15.1 managed by Supabase             │
│              │ Volumes: postgres-data                          │
├──────────────┼─────────────────────────────────────────────────┤
│    auth      │ GoTrue (Supabase Auth) v2.151                   │
│              │ Handles: signup, login, JWT, email verify       │
├──────────────┼─────────────────────────────────────────────────┤
│     rest     │ PostgREST v12 — auto REST API over Postgres     │
│              │ Used for: Supabase client library queries       │
├──────────────┼─────────────────────────────────────────────────┤
│   storage    │ Supabase Storage API v1.0.6                     │
│              │ Bucket: product-images                          │
│              │ Max file size: 50MB                             │
├──────────────┼─────────────────────────────────────────────────┤
│   imgproxy   │ Image transformation service                    │
│              │ Used for: resizing product images on-the-fly   │
├──────────────┼─────────────────────────────────────────────────┤
│     kong     │ Kong API Gateway v2.8.1 (declarative config)   │
│              │ Routes: /auth → GoTrue, /rest → PostgREST,      │
│              │         /storage → Storage, /realtime → WS      │
├──────────────┼─────────────────────────────────────────────────┤
│    nginx     │ Nginx 1.25 reverse proxy                        │
│              │ Hosts: staticwears.com, admin.staticwears.com,  │
│              │        api.staticwears.com                      │
│              │ SSL: Let's Encrypt (auto-renew)                 │
└──────────────┴─────────────────────────────────────────────────┘
```

### Communication Patterns

```
Synchronous (HTTP/DB):
  storefront ──HTTP──► /api/orders ──DB──► PostgreSQL
  admin      ──HTTP──► /api/admin/* ──DB──► PostgreSQL

Asynchronous (Kafka):
  storefront ──publish──► Kafka ──consume──► email-worker ──► Resend
  admin      ──publish──► Kafka ──consume──► email-worker ──► Resend

Internal Docker DNS:
  Next.js server ──► http://kong:8000 (Supabase internal)
  Browser        ──► https://api.staticwears.com (Supabase public)
```

---

## 7. API Reference

### Storefront API Routes

All storefront routes are under `apps/storefront/src/app/api/`

#### Products

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | None | List products with filters |

**GET /api/products query parameters:**

| Param | Type | Description |
|---|---|---|
| category | string | Filter by category slug |
| search | string | Search by product name |
| sort | string | `newest` \| `price_asc` \| `price_desc` |
| limit | number | Results per page (default: 20) |
| offset | number | Pagination offset |

#### Orders

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | Clerk | Get customer's own orders |
| POST | `/api/orders` | Clerk | Place a new order |

**POST /api/orders body:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid",
      "product_name": "Classic Hoodie",
      "variant_desc": "Black / M",
      "quantity": 1,
      "unit_price": 4500
    }
  ],
  "shipping": {
    "name": "Chamidu Jayaneththi",
    "phone": "0771234567",
    "address": "42 Galle Road, Colombo 03"
  },
  "notes": "Optional delivery note"
}
```

#### Payments

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/create-session` | Clerk | Create Stripe checkout session |
| POST | `/api/payments/webhook` | Stripe sig | Stripe webhook handler |
| POST | `/api/payments/paypal/create-order` | Clerk | Create PayPal order |
| POST | `/api/payments/paypal/capture` | Clerk | Capture PayPal payment |
| POST | `/api/payments/payhere/hash` | Clerk | Generate PayHere hash |
| POST | `/api/payments/payhere/notify` | PayHere sig | PayHere webhook handler |

#### Users

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Clerk | Get own profile |
| PATCH | `/api/users/profile` | Clerk | Update own profile |

---

### Admin API Routes

All admin routes are under `apps/admin/src/app/api/admin/` and require `requireAdmin()`.

#### Products

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/products` | List all products |
| POST | `/api/admin/products` | Create product |
| GET | `/api/admin/products/:id` | Get product with variants, images, categories |
| PATCH | `/api/admin/products/:id` | Update product, variants, images |
| DELETE | `/api/admin/products/:id` | Delete product (cascades) |

#### Categories & Brands

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/categories` | List all categories |
| POST | `/api/admin/categories` | Create category (auto-slug) |
| PATCH | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| GET | `/api/admin/brands` | List all brands |
| POST | `/api/admin/brands` | Create brand |
| PATCH | `/api/admin/brands/:id` | Update brand |
| DELETE | `/api/admin/brands/:id` | Delete brand |

#### Orders

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/orders` | List all orders with items |
| PATCH | `/api/admin/orders/:id` | Update order status → triggers email |

**Order status values:** `pending` → `confirmed` → `processing` → `shipped` → `delivered` → `cancelled`

#### Users

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/users` | List all Clerk users |
| PATCH | `/api/admin/users/:id` | Update user name/role |
| DELETE | `/api/admin/users/:id` | Delete Clerk user |
| POST | `/api/admin/users/:id` | `{ action: "reset-password" }` — generate reset link |

#### Banners

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/banners` | List all banners |
| POST | `/api/admin/banners` | Create banner |
| PATCH | `/api/admin/banners/:id` | Update banner / toggle active |
| DELETE | `/api/admin/banners/:id` | Delete banner |

#### Image Upload

| Method | Route | Description |
|---|---|---|
| POST | `/api/admin/upload` | Direct file upload (multipart) |
| GET | `/api/admin/upload/sign?ext=jpg` | Get signed URL for client-side upload |

**Upload flow:**
```
Admin browser
    │
    │  GET /api/admin/upload/sign?ext=jpg
    ▼
Admin API route ──► Supabase Storage (create signed URL)
    │
    │  Returns: { signedUrl, path, url }
    ▼
Admin browser ──PUT file──► signedUrl (direct to Supabase Storage)
    │
    │  Done — url is the public CDN URL
```

#### Export

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/export/orders` | Download orders as Excel (.xlsx) |
| GET | `/api/admin/export/users` | Download customers as Excel (.xlsx) |

#### Settings & Testing

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/settings` | Get all site settings |
| POST | `/api/admin/settings` | Upsert site settings |
| GET | `/api/admin/test-email?type=order&to=email` | Send test email |

---

## 8. Shared Packages

### `@static-wears/shared`
Core types and Supabase client factories used by every package and app.

```typescript
// Supabase client factories
createSupabaseServerClient(): Promise<SupabaseClient>  // Uses cookies, for Server Components
createSupabaseAdminClient(): SupabaseClient            // Uses service role, bypasses RLS

// Key types
interface Product { id, name, slug, description, base_price, status, brand_id,
                    brand?, variants?, images?, product_categories? }
interface ProductVariant { id, product_id, size, color, stock_qty, price_adj,
                           sku, description, image_url }
interface ProductImage { id, product_id, image_path, is_main, sort_order }
interface Order { id, customer_id, status, total_amount, shipping_name,
                  shipping_phone, shipping_addr, notes, items? }
interface Profile { id, full_name, email, phone, avatar_url, role }
interface Category { id, name, slug, description, status }
interface Brand { id, name, slug, description }
```

> **Internal URL switch:** Both client factories check `SUPABASE_INTERNAL_URL` first, falling back to `NEXT_PUBLIC_SUPABASE_URL`. This means Docker containers use `http://kong:8000` (avoiding hairpin NAT), while the browser always uses `https://api.staticwears.com`.

### `@static-wears/product-service`

```typescript
// Queries
getProducts(filters?)             → Product[]        // Storefront listing
getAllProductsAdmin()              → Product[]        // Admin listing
getProductBySlug(slug)            → Product | null   // Storefront detail
getProductById(id)                → Product | null   // Admin edit
getVariantStockInfo(variantId)    → StockInfo | null // After order — for low stock check
getCategories()                   → Category[]       // Active only
getBrands()                       → Brand[]          // All, ordered by name

// Mutations
createProduct(data)               → { product, error }
updateProduct(id, data)           → { error }
deleteProduct(id)                 → { error }
updateProductStock(variantId, qty)→ { error }        // Admin direct set
decreaseStock(variantId, qty)     → { error }        // Atomic DB function — checkout only
```

### `@static-wears/order-service`

```typescript
// Queries
getOrdersByCustomer(customerId)   → Order[]         // Customer's orders
getOrderById(id)                  → Order | null    // User-visible (RLS)
getOrderByIdAdmin(id)             → Order | null    // Admin (service role)
getAllOrders()                     → Order[]         // Admin listing

// Mutations
createOrder(data)                 → { order, error }
// data = { customer_id, items[], shipping{name,phone,address}, notes? }
// Atomically: inserts order → inserts order_items → calls decreaseStock per variant
// Rolls back if any stock check fails

updateOrderStatus(orderId, status)→ { error }
```

### `@static-wears/user-service`

```typescript
getProfile(userId)                → Profile | null
getUserAddresses(userId)          → UserAddress[]
getAllUsers()                      → Profile[]         // Admin only

updateProfile(userId, data)       → { error }
addAddress(data)                  → { error }
deleteAddress(addressId, userId)  → { error }
```

### `@static-wears/payment-service`

```typescript
stripe                                   // Configured Stripe instance (API 2025-02-24)

createCheckoutSession(data)       → { sessionUrl, sessionId, error }
// data = { orderId, items[], customerEmail, successUrl, cancelUrl }
// Currency: LKR | Prices in cents (× 100)

constructWebhookEvent(body, sig)  → Stripe.Event | null
// Validates STRIPE_WEBHOOK_SECRET signature
```

### `@static-wears/email-service`

```typescript
sendOrderConfirmation(data)       → { error }
// data = { to, customerName, orderId, items[], total, shippingAddress }
// From: orders@staticwears.com
// Template: Full branded HTML with item table, steps, CTA

sendShippingUpdate(data)          → { error }
// data = { to, customerName, orderId, status }
// From: orders@staticwears.com
// Template: Status timeline (processing → shipped → delivered)

sendLowStockAlert(data)           → { error }
// data = { items[{ productName, color, size, currentStock, threshold }] }
// To: ADMIN_EMAIL env var
// From: alerts@staticwears.com
// Template: Admin alert with variant table and inventory CTA
```

### `@static-wears/kafka`

```typescript
// Topics
TOPICS.ORDER_PLACED         = 'order.placed'
TOPICS.ORDER_STATUS_CHANGED = 'order.status.changed'
TOPICS.STOCK_LOW            = 'stock.low'

// Producer
publishEvent(topic, payload) → Promise<void>
// Lazy-connects producer on first call
// Payload is JSON-stringified

// Types
interface OrderPlacedEvent { orderId, to, customerName, items[], total, shippingAddress }
interface OrderStatusChangedEvent { orderId, to, customerName, status }
interface StockLowEvent { items[{ productName, color, size, currentStock, threshold }] }
```

---

## 9. Authentication & Authorization

### Overview

Static Wears uses a **dual-layer auth system**:
- **Clerk** — User identity, sessions, JWT tokens
- **Supabase RLS** — Database-level row security

### Storefront Auth Flow

```
User visits /account or /checkout (protected)
        │
        ▼
proxy.ts (Clerk middleware)
        │
        │ Is user authenticated?
        │
     No ▼                      Yes ▼
  Redirect to /login       Allow through
        │
        ▼
/login page — Clerk <SignIn> component
        │
        ▼
Clerk authenticates → sets session cookie
        │
        ▼
User redirected to original page
```

**Protected storefront routes** (in `apps/storefront/src/proxy.ts`):
- `/account` — User profile & order history
- `/orders` — Order tracking
- `/checkout` — Payment flow

### Admin Auth Flow

```
User visits any admin page (e.g., /dashboard)
        │
        ▼
proxy.ts (Admin Clerk middleware)
        │
        │ Is user authenticated?
        │
     No ▼                           Yes ▼
  Redirect to /login          Check admin permission
                                      │
              Not admin ▼             │  Is admin ▼
          Return 403              Allow through
```

**Admin permission check** (`apps/admin/src/lib/require-admin.ts`):
```typescript
async function requireAdmin(): Promise<string | null> {
  const { userId } = await auth();                    // 1. Must be logged in
  if (!userId) return null;

  const adminIds = process.env.ADMIN_USER_IDS         // 2. Check env var allowlist
    .split(',').map(s => s.trim());
  if (adminIds.includes(userId)) return userId;       //    Fast path

  const user = await clerkClient().users.getUser(userId);
  return user.publicMetadata?.role === 'admin'        // 3. Check Clerk metadata
    ? userId : null;
}
```

**To make a user admin**, either:
- Add their Clerk `userId` to `ADMIN_USER_IDS=user_xxx,user_yyy` in `.env.production`
- Or set `publicMetadata.role = "admin"` in the Clerk Dashboard

### Supabase RLS + Clerk Integration

Supabase uses its own JWT (from GoTrue/auth container). In this setup, Clerk handles authentication and Supabase RLS uses the **service role** for all server-side queries (bypasses RLS) while clients use the **anon key** (respects RLS via auth.uid()).

---

## 10. Payment Integrations

### Payment Flow Comparison

```
┌──────────────────────────────────────────────────────────────┐
│                    STRIPE (Card)                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Checkout Page                                               │
│      │ POST /api/payments/create-session                     │
│      │ Body: { orderId, items[] }                            │
│      ▼                                                       │
│  Stripe API ─────────────────────────────────────────────►  │
│      │ Returns: sessionUrl                                   │
│      ▼                                                       │
│  Browser redirects to Stripe hosted checkout                 │
│      │                                                       │
│      │ Customer pays on Stripe page                          │
│      │                                                       │
│      ▼                                                       │
│  Stripe Webhook → POST /api/payments/webhook                 │
│      │ Event: checkout.session.completed                     │
│      │ → Mark payment 'paid'                                 │
│      │ → Update order to 'confirmed'                         │
│      │                                                       │
│      ▼                                                       │
│  Browser redirected to /orders (success URL)                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    PAYPAL                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Checkout Page                                               │
│      │ POST /api/payments/paypal/create-order                │
│      │ Body: { orderId, amount (LKR) }                       │
│      ▼                                                       │
│  PayPal REST API                                             │
│      │ amount converted: LKR ÷ 320 = USD                    │
│      │ Returns: paypalOrderId                                │
│      │                                                       │
│      ▼                                                       │
│  PayPal SDK renders payment button                           │
│      │ Customer approves in PayPal popup                     │
│      │                                                       │
│      ▼                                                       │
│  POST /api/payments/paypal/capture                           │
│      │ Body: { paypalOrderId, orderId }                      │
│      │ → Mark payment 'paid'                                 │
│      │ → Update order to 'confirmed'                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    PAYHERE (Local LKR)                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Checkout Page                                               │
│      │ POST /api/payments/payhere/hash                       │
│      │ Body: { orderId, amount }                             │
│      ▼                                                       │
│  API generates MD5 hash signature                            │
│      │ Returns: { merchantId, hash, payhereUrl, ... }        │
│      │                                                       │
│      ▼                                                       │
│  Browser submits form to PayHere gateway                     │
│      │ (payhereUrl = sandbox or live based on PAYHERE_ENV)   │
│      │                                                       │
│      │ Customer pays via local bank/card                     │
│      │                                                       │
│      ▼                                                       │
│  PayHere Webhook → POST /api/payments/payhere/notify         │
│      │ Validates MD5 signature                               │
│      │ status_code 2 = paid → update order 'confirmed'       │
│      │ status_code 0 = pending                               │
│      │ other = failed                                        │
└──────────────────────────────────────────────────────────────┘
```

### Currency Handling

| Payment Provider | Currency | Notes |
|---|---|---|
| Stripe | LKR | Native support, prices × 100 for cents |
| PayPal | USD | Converted: LKR ÷ 320 (hardcoded rate) |
| PayHere | LKR | Native Sri Lankan LKR support |

---

## 11. Email System

### Architecture

```
Trigger Event                 Kafka               email-worker          Resend
─────────────────────────────────────────────────────────────────────────────
                              ┌──────────────────┐
Customer places order ──────► │  order.placed    │ ──► sendOrderConfirmation()
                              ├──────────────────┤         │
Admin updates status ───────► │order.status.     │ ──► sendShippingUpdate()
                              │  changed         │         │
                              ├──────────────────┤         │
Stock hits threshold ───────► │  stock.low       │ ──► sendLowStockAlert()
(after each order)            └──────────────────┘         │
                                                            │
                                                            ▼
                                                     Resend API (staticwears.com domain)
                                                            │
                                                            ▼
                                                     Recipient inbox ✓
```

### Email Templates

#### 1. Order Confirmation
- **From:** `orders@staticwears.com`
- **Subject:** `Order Confirmed — #XXXXXXXX`
- **Content:** Order ID badge, items table, total, shipping address, 3-step status, CTA button
- **File:** `packages/email-service/src/templates/order-confirmation.ts`

#### 2. Shipping Update
- **From:** `orders@staticwears.com`
- **Subject:** `Your Order Is {status} — Static Wears`
- **Content:** Status-specific message, visual timeline (Processing → Shipped → Delivered), CTA
- **Status colours:** Yellow (processing), Blue (shipped), Green (delivered), Red (cancelled)
- **File:** `packages/email-service/src/templates/shipping-update.ts`

#### 3. Low Stock Alert (Admin)
- **From:** `alerts@staticwears.com`
- **To:** `ADMIN_EMAIL` env var
- **Subject:** `⚠️ Low Stock Alert — N variant(s) need restocking`
- **Content:** Table of low-stock variants with current qty, urgency badges, admin link
- **File:** `packages/email-service/src/templates/low-stock-alert.ts`

### Testing Emails

While logged into the admin panel, visit:

```
# Order confirmation
https://admin.staticwears.com/api/admin/test-email?type=order&to=your@email.com

# Shipping update
https://admin.staticwears.com/api/admin/test-email?type=shipping&to=your@email.com

# Low stock alert
https://admin.staticwears.com/api/admin/test-email?type=lowstock&to=your@email.com
```

### Resend Configuration

1. Create account at [resend.com](https://resend.com)
2. Add domain (`staticwears.com`) and verify DNS records (DKIM, SPF)
3. Copy API key → set `RESEND_API_KEY` in `.env.production`
4. Set `ADMIN_EMAIL` for low stock alerts
5. Set `LOW_STOCK_THRESHOLD` (default: 5 units)

---

## 12. Kafka Event Bus

### Why Kafka?

Email sending is **fire-and-forget** — it shouldn't block the HTTP response or fail the order if Resend is temporarily down. Kafka decouples the storefront/admin from the email sending process.

```
Without Kafka (bad):                  With Kafka (good):
Order API → send email → respond      Order API → respond immediately
           (blocks 2-5 seconds)                │
           (fails if Resend down)              └► Kafka → email-worker (async)
```

### Kafka Setup (KRaft Mode)

Apache Kafka 3.7.1 running without Zookeeper (KRaft mode). Single-broker, single-node setup suitable for production at this scale.

```yaml
# docker-compose.yml excerpt
kafka:
  environment:
    KAFKA_NODE_ID: 0
    KAFKA_PROCESS_ROLES: broker,controller     # Same node is both
    KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"    # Topics auto-created on first publish
    KAFKA_LOG_RETENTION_HOURS: 168             # 7 days retention
```

### Producer Usage

```typescript
import { publishEvent, TOPICS } from '@static-wears/kafka';

// Non-blocking — use .catch() to log errors without disrupting response
publishEvent(TOPICS.ORDER_PLACED, {
  orderId: order.id,
  to: customerEmail,
  customerName: 'John',
  items: [...],
  total: 8900,
  shippingAddress: '42 Galle Road...',
}).catch(err => console.error('[orders] Kafka publish failed:', err));
```

### Consumer (email-worker)

```typescript
// packages/kafka/src/workers/email.ts
const consumer = kafka.consumer({ groupId: 'email-service' });

await consumer.subscribe({
  topics: ['order.placed', 'order.status.changed', 'stock.low'],
  fromBeginning: false,  // Only process new messages
});
```

### Low Stock Detection Flow

```
POST /api/orders (order placed)
      │
      │  1. createOrder() succeeds
      │
      │  2. For each variant_id in order:
      │     getVariantStockInfo(variant_id) → { currentStock, ... }
      │
      │  3. Filter: currentStock <= LOW_STOCK_THRESHOLD (default: 5)
      │
      │  4. If any low-stock variants found:
      │     publishEvent(TOPICS.STOCK_LOW, { items: [...] })
      │
      ▼
  email-worker receives stock.low event
      │
      ▼
  sendLowStockAlert({ items }) → ADMIN_EMAIL inbox
```

---

## 13. File Storage

### Supabase Storage Architecture

```
Admin browser
    │
    │  GET /api/admin/upload/sign?ext=jpg
    ▼
Admin Next.js (server)
    │  createSignedUploadUrl('product-images', `products/${uuid}.jpg`)
    │  Replaces internal URL (http://kong:8000) with public URL
    ▼
Returns to browser: {
  signedUrl: 'https://api.staticwears.com/storage/v1/object/sign/...',
  path: 'products/abc123.jpg',
  url: 'https://api.staticwears.com/storage/v1/object/public/product-images/products/abc123.jpg'
}
    │
    │  Browser PUT file → signedUrl (direct upload to Supabase Storage)
    │
    ▼
File stored at /var/lib/storage (Docker volume: storage-data)
    │
    │  Public CDN URL:
    ▼
https://api.staticwears.com/storage/v1/object/public/product-images/{path}
```

### Storage Bucket

- **Name:** `product-images`
- **Visibility:** Public (anyone can read)
- **Max file size:** 50MB
- **Storage backend:** Local filesystem (`/var/lib/storage` in container)
- **Image transformations:** Via imgproxy at port 5001

### Internal URL Rewriting

When `SUPABASE_INTERNAL_URL=http://kong:8000` is set, the signed URL contains the internal Docker host. Before returning it to the browser, the API replaces the internal URL with the public URL:

```typescript
// apps/admin/src/app/api/admin/upload/sign/route.ts
const internalUrl = process.env.SUPABASE_INTERNAL_URL ?? '';
const publicUrl   = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const signedUrl = internalUrl
  ? data.signedUrl.replace(internalUrl, publicUrl)
  : data.signedUrl;
```

### Next.js Image Optimisation

Both `next.config.mjs` files include `api.staticwears.com` in `remotePatterns` so the Next.js `<Image>` component can load and optimise images from Supabase Storage:

```javascript
remotePatterns: [
  { protocol: 'https', hostname: 'api.staticwears.com',
    pathname: '/storage/v1/object/public/**' }
]
```

---

## 14. Infrastructure & Deployment

### Server Specification

| Component | Details |
|---|---|
| Provider | DigitalOcean |
| Type | VPS (Droplet) |
| OS | Ubuntu |
| Project path | `/home/deploy/staticwears` |

### Docker Compose Services Summary

| Service | Image | Ports | Health Check |
|---|---|---|---|
| nginx | nginx:1.25-alpine | 80, 443 | - |
| storefront | staticwears-storefront | 3000 (internal) | - |
| admin | staticwears-admin | 3001 (internal) | - |
| email-worker | staticwears-email-worker | - | - |
| kafka | apache/kafka:3.7.1 | 9092, 9093 | list topics |
| db | postgres:15.1.0.147 | 5432 (internal) | pg_isready |
| auth | supabase/gotrue:2.151.0 | 9999 (internal) | - |
| rest | postgrest/postgrest:12.2.0 | 3000 (internal) | - |
| storage | supabase/storage-api:1.0.6 | 5000 (internal) | - |
| imgproxy | darthsim/imgproxy:v3.8.0 | 5001 (internal) | - |
| kong | kong:2.8.1 | 8000, 8443 (internal) | - |

### Volumes

| Volume | Purpose |
|---|---|
| `postgres-data` | PostgreSQL data directory |
| `storage-data` | Uploaded product images |
| `kafka-data` | Kafka log segments |
| `certbot-www` | Let's Encrypt challenge files |

### Nginx Virtual Hosts

```
https://staticwears.com         → proxy_pass http://storefront:3000
https://www.staticwears.com     → proxy_pass http://storefront:3000
https://admin.staticwears.com   → proxy_pass http://admin:3001
https://api.staticwears.com     → proxy_pass http://kong:8000
http://* → redirect 301 → https
```

### Deployment Commands

```bash
# Standard deploy (pull latest + rebuild changed services)
cd /home/deploy/staticwears
git pull
docker compose --env-file .env.supabase build storefront admin email-worker
docker compose --env-file .env.supabase up -d
docker compose --env-file .env.supabase restart nginx

# Rebuild specific service only
docker compose --env-file .env.supabase build admin
docker compose --env-file .env.supabase up -d admin

# View logs
docker compose --env-file .env.supabase logs storefront --tail=50 -f
docker compose --env-file .env.supabase logs admin --tail=50 -f
docker compose --env-file .env.supabase logs email-worker --tail=50 -f

# Check service health
docker compose --env-file .env.supabase ps

# Clean up old images
docker image prune -f
```

### Dockerfiles

**Dockerfile.storefront / Dockerfile.admin** (multi-stage build):
```
Stage 1 (builder): node:22-alpine
  - Copy monorepo
  - pnpm install --frozen-lockfile
  - next build (output: standalone)

Stage 2 (runner): node:22-alpine
  - Copy .next/standalone
  - Copy .next/static
  - Copy public/
  - Expose port 3000/3001
  - CMD: node apps/storefront/server.js
```

**Dockerfile.email-worker**:
```
node:22-alpine
  - Copy monorepo
  - pnpm install --frozen-lockfile
  - CMD: pnpm --filter @static-wears/kafka run email-worker
```

---

## 15. Environment Variables

### Storefront (`.env.production` at `apps/storefront/`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://api.staticwears.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_INTERNAL_URL=http://kong:8000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_BASE_URL=https://api.paypal.com
NEXT_PUBLIC_PAYHERE_MERCHANT_ID=...
PAYHERE_MERCHANT_ID=...
PAYHERE_MERCHANT_SECRET=...
PAYHERE_ENV=production

# Email
RESEND_API_KEY=re_...
ADMIN_EMAIL=your@email.com
LOW_STOCK_THRESHOLD=5

# Kafka (Docker internal)
KAFKA_BROKERS=kafka:9092

# URLs
NEXT_PUBLIC_APP_URL=https://staticwears.com
NEXT_PUBLIC_ADMIN_URL=https://admin.staticwears.com
```

### Admin (`.env.production` at `apps/admin/`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://api.staticwears.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_INTERNAL_URL=http://kong:8000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
ADMIN_USER_IDS=user_xxx,user_yyy

# Kafka
KAFKA_BROKERS=kafka:9092

# URLs
NEXT_PUBLIC_APP_URL=https://staticwears.com
NEXT_PUBLIC_ADMIN_URL=https://admin.staticwears.com
```

### Supabase Stack (`.env.supabase` at project root)

```env
POSTGRES_PASSWORD=your_strong_password
JWT_SECRET=your_jwt_secret_min_32_chars
SITE_URL=https://staticwears.com
ADMIN_URL=https://admin.staticwears.com
API_EXTERNAL_URL=https://api.staticwears.com
```

---

## 16. Frontend — Storefront

### Pages

| Route | File | Description |
|---|---|---|
| `/` | `(shop)/page.tsx` | Homepage — hero slider, banners, featured products |
| `/shop` | `(shop)/shop/page.tsx` | Product grid with filters (category, search, sort) |
| `/shop/products/:slug` | `(shop)/products/[slug]/page.tsx` | Product detail page |
| `/login` | `(auth)/login/page.tsx` | Sign in (Clerk `<SignIn>`) |
| `/register` | `(auth)/register/page.tsx` | Sign up (Clerk `<SignUp>`) |
| `/account` | `account/page.tsx` | User dashboard (requires auth) |
| `/cart` | `cart/page.tsx` | Shopping cart |
| `/checkout` | `checkout/page.tsx` | Multi-payment checkout |
| `/orders` | `orders/page.tsx` | Order history (requires auth) |
| `/size-guide` | `size-guide/page.tsx` | Size chart |
| `/shipping` | `shipping/page.tsx` | Shipping policy |
| `/returns` | `returns/page.tsx` | Returns policy |
| `/terms` | `terms/page.tsx` | Terms of service |
| `/privacy` | `privacy/page.tsx` | Privacy policy |
| `/contact` | `contact/page.tsx` | Contact page |

### Cart System

The cart is stored in **localStorage** via React Context (`CartContext`):

```typescript
// context/cart-context.tsx
interface CartItem {
  product_id, variant_id, product_name, variant_desc,
  image_path, unit_price, quantity
}

// Actions
dispatch({ type: 'ADD_ITEM', payload: CartItem })
dispatch({ type: 'UPDATE_QTY', payload: { variant_id, quantity } })
dispatch({ type: 'REMOVE_ITEM', payload: { variant_id } })
dispatch({ type: 'CLEAR_CART' })
```

### Product Detail — Gallery Behaviour (Etsy-style)

```
User selects colour → Gallery switches to that colour's images
User selects size   → Gallery STAYS on same colour's images (no change)

colorImageMap = {
  "Black": ["url-black-1", "url-black-2"],
  "White": ["url-white-1"],
}

galleryPaths = colorImageMap[selectedColor] + productLevelImages
```

### Layout Components

| Component | File | Description |
|---|---|---|
| `Navbar` | `layout/navbar.tsx` | Desktop top navigation with cart icon |
| `BottomNav` | `layout/bottom-nav.tsx` | Mobile fixed bottom navigation |
| `Footer` | `layout/footer.tsx` | Links, social icons, legal |
| `BannerSlider` | `layout/banner-slider.tsx` | Hero banner carousel |
| `HeroSection` | `layout/hero-section.tsx` | Homepage hero with animated orbs |

### Auth Layout (Split Panel Design)

```
┌──────────────────────────────────────────────────┐
│  LEFT PANEL (hidden mobile)   │  RIGHT PANEL     │
│  ─────────────────────────    │  ─────────────── │
│  Giant "SW" background text   │  Logo bar        │
│  Static Wears logo            │                  │
│  "DROP. COLLECT. WEAR."       │  Sign In         │
│  Feature bullets              │  heading         │
│                               │                  │
│  Dark bg + orange accents     │  Clerk form      │
│                               │  embedded        │
└──────────────────────────────────────────────────┘
```

---

## 17. Frontend — Admin Panel

### Pages

| Route | File | Description |
|---|---|---|
| `/login` | `login/page.tsx` | Admin sign in |
| `/dashboard` | `dashboard/page.tsx` | KPIs, revenue chart, recent orders |
| `/products` | `products/page.tsx` | Product listing with search |
| `/products/new` | `products/new/page.tsx` | Create product + variants + images |
| `/products/:id/edit` | `products/[id]/edit/page.tsx` | Edit product |
| `/categories` | `categories/page.tsx` | Category management |
| `/brands` | `brands/page.tsx` | Brand management |
| `/orders` | `orders/page.tsx` | Order list + status management |
| `/users` | `users/page.tsx` | Customer list + user actions |
| `/banners` | `banners/page.tsx` | Homepage banner CRUD |
| `/settings` | `settings/page.tsx` | Site settings, notification toggles |

### Mobile-Responsive Shell

```
AdminShell (apps/admin/src/components/layout/admin-shell.tsx)
  │
  ├── Desktop (md+): Sidebar always visible
  │     └── Sidebar.tsx — Full navigation list
  │
  └── Mobile:
        ├── Top bar — hamburger + "Static Wears Admin" title
        ├── Slide-in drawer — full Sidebar behind overlay
        ├── Main content — padded, scrollable
        └── Bottom nav — Home | Products | Orders | Customers | More
```

### Product Creation — Variant + Image Flow

```
Product Form
    │
    ├── Toggle "Has Variants" ON
    │       │
    │       ▼
    ├── Add variant rows: Color + Size + Price + Stock
    │
    └── COLOR PHOTOS section (auto-generated per unique colour)
            │
            ├── "BLACK PHOTOS" ──► upload images for Black variants
            └── "WHITE PHOTOS" ──► upload images for White variants

On save:
  variant.image_url = colorImages[variant.color][0].url
  (all sizes of same colour share the same image)
```

### Image Upload Component

```
ImageUploader (apps/admin/src/components/products/image-uploader.tsx)

1. User selects/drops image file
2. GET /api/admin/upload/sign?ext={ext} → { signedUrl, path, url }
3. PUT file → signedUrl (direct to Supabase Storage)
4. url stored in state + displayed as thumbnail
5. First image auto-set as main (orange star badge)
6. Click another to change main image
```

### Dashboard KPIs

The dashboard (`/dashboard`) shows:
- Total revenue (sum of paid payments)
- Total orders (count)
- Total customers (count)
- Average order value
- Revenue chart (monthly, Recharts)
- Recent orders table
- Low stock alerts widget

---

## 18. Local Development Setup

### Prerequisites

- Node.js 22+
- pnpm 9 (`npm install -g pnpm@9`)
- Docker Desktop
- Git

### Step 1 — Clone and install

```bash
git clone https://github.com/chamiduuuu/staticwearslk.git
cd staticwearslk
pnpm install
```

### Step 2 — Start Supabase stack

```bash
# Start database, auth, storage, kong, etc.
docker compose --env-file .env.supabase up -d db auth rest storage imgproxy kong
```

### Step 3 — Run schema

```bash
# Apply database schema
psql -h localhost -U postgres -d postgres -f SUPABASE_SCHEMA.sql
```

### Step 4 — Environment files

```bash
# Storefront
cp apps/storefront/.env.production.example apps/storefront/.env.local
# Edit with your Clerk, Stripe, PayPal, PayHere, Resend keys

# Admin
cp apps/admin/.env.local.example apps/admin/.env.local
# Edit with your Clerk keys + ADMIN_USER_IDS
```

### Step 5 — Start Kafka

```bash
docker compose --env-file .env.supabase up -d kafka
```

### Step 6 — Run apps

```bash
# Terminal 1 — Storefront (http://localhost:3000)
pnpm --filter @static-wears/storefront dev

# Terminal 2 — Admin (http://localhost:3001)
pnpm --filter @static-wears/admin dev

# Terminal 3 — Email worker
pnpm --filter @static-wears/kafka run email-worker
```

### Project Scripts

```bash
# Build all
pnpm build

# Lint all
pnpm lint

# Build specific app
pnpm --filter @static-wears/storefront build
pnpm --filter @static-wears/admin build

# Type check
pnpm --filter @static-wears/admin type-check
```

---

## 19. CI/CD Pipeline

### GitHub Actions Auto-Deploy

**File:** `.github/workflows/deploy.yml`

**Trigger:** Push to `main` branch

**Flow:**
```
Developer pushes to main
        │
        ▼
GitHub Actions (ubuntu-latest runner)
        │
        │  SSH into DigitalOcean VPS
        │  using appleboy/ssh-action@v1.0.3
        │
        ▼
VPS executes:
  1. git pull origin main
  2. docker compose build storefront admin email-worker --no-cache
  3. docker compose up -d (rolling update)
  4. docker compose restart nginx
  5. docker image prune -f (cleanup)
  6. docker compose ps (status check)
```

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `VPS_HOST` | DigitalOcean droplet IP address |
| `VPS_USER` | SSH username (e.g., `deploy`) |
| `SSH_PRIVATE_KEY` | SSH private key for VPS access |

### Setting Up the Deploy Key

```bash
# On VPS — generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# Add public key to authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Copy private key content → paste into GitHub secret SSH_PRIVATE_KEY
cat ~/.ssh/deploy_key
```

---

## Appendix — Quick Reference

### Common Fixes

| Problem | Cause | Fix |
|---|---|---|
| 502 Bad Gateway | Container restarted, nginx lost upstream | `docker compose restart nginx` |
| Images broken | `api.staticwears.com` not in remotePatterns | Already fixed in next.config.mjs |
| Product edit "not found" | PostgREST embedded join failing | Already fixed — categories fetched separately |
| Auth redirects to Clerk hosted | Missing `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Add to `.env.production` |
| Email not sending | Wrong domain or RESEND_API_KEY placeholder | Verify domain in Resend dashboard |
| Stock oversold | Race condition | Protected by `decrease_stock()` DB function |
| Kafka unhealthy on startup | Slow start | `start_period: 120s` in health check |

### Useful VPS Commands

```bash
# Check all container status
docker compose --env-file .env.supabase ps

# Follow logs for all services
docker compose --env-file .env.supabase logs -f

# Restart single service
docker compose --env-file .env.supabase restart admin

# Enter running container shell
docker exec -it staticwears-admin sh

# Check env vars inside container
docker compose --env-file .env.supabase exec admin env | grep RESEND
```

### Architecture Decisions

| Decision | Why |
|---|---|
| Self-hosted Supabase | Data sovereignty, no cloud fees, full control |
| Kafka over HTTP callbacks | Decouples email from order flow, retry-able, non-blocking |
| Clerk for auth | Handles complexity of sessions, social login, MFA |
| pnpm workspaces | Shared packages without publishing to npm |
| KRaft Kafka (no Zookeeper) | Simpler ops, fewer containers, Kafka 3.7+ default |
| Next.js standalone output | Minimal Docker image, no unnecessary node_modules |
| Service role for admin queries | Clean admin access without RLS complexity |

---

*Documentation generated for HND Final Project — Static Wears E-Commerce Platform*  
*Chamidu Jayaneththi | Hardy ATI Sri Lanka | 2026*
