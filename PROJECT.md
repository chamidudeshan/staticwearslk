# Static Wears — Full Project Documentation

> **HND Dissertation Project** · Premium Sri Lankan Streetwear E-Commerce Platform  
> Built by **Chamidu Jayaneththi** · Hardy ATI Sri Lanka · 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Repository Structure](#4-repository-structure)
5. [Applications](#5-applications)
6. [Service Packages](#6-service-packages)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Authentication & Authorisation](#9-authentication--authorisation)
10. [Payment Integration](#10-payment-integration)
11. [File Storage](#11-file-storage)
12. [Email & Events](#12-email--events)
13. [Environment Variables](#13-environment-variables)
14. [Running Locally](#14-running-locally)
15. [Key Features](#15-key-features)
16. [Pages Reference](#16-pages-reference)

---

## 1. Project Overview

Static Wears is a full-stack, production-ready e-commerce web application for a premium streetwear brand based in Sri Lanka. It follows a **microservices-inspired monorepo** architecture, separating the customer storefront, the admin dashboard, and domain logic into individual packages.

The platform supports the complete shopping lifecycle — product discovery, product detail, cart, multi-gateway checkout, order tracking, and post-purchase communication — alongside a fully-featured admin dashboard for managing every aspect of the store.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.4 (App Router) |
| Language | TypeScript 5.4 |
| Monorepo | pnpm Workspaces + Turborepo |
| Styling | Tailwind CSS 3.4 |
| Auth | Clerk (@clerk/nextjs v6) |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Payments | Stripe · PayPal · PayHere |
| Email | Resend |
| Event Bus | Kafka (KafkaJS) |
| Excel Export | ExcelJS |
| UI Primitives | Radix UI |
| Icons | Lucide React |
| Toast | Sonner |
| Charts | Recharts |
| Fonts | Bebas Neue (display) · Space Mono (mono) |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Monorepo Root                           │
│                    (pnpm workspaces + Turbo)                    │
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────────────┐    │
│  │   apps/storefront │          │      apps/admin           │    │
│  │   (port 3000)     │          │      (port 3001)          │    │
│  │                  │          │                          │    │
│  │  Customer-facing │          │  Admin dashboard         │    │
│  │  Next.js app     │          │  Next.js app             │    │
│  └────────┬─────────┘          └────────┬─────────────────┘    │
│           │                             │                       │
│           └──────────────┬──────────────┘                       │
│                          │                                       │
│              ┌───────────▼───────────────────────┐              │
│              │         packages/                  │              │
│              │                                   │              │
│              │  shared          product-service  │              │
│              │  user-service    order-service    │              │
│              │  payment-service email-service    │              │
│              │  kafka                            │              │
│              └───────────────────────────────────┘              │
│                                                                 │
│  External Services                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Supabase │ │  Clerk   │ │  Stripe  │ │ PayPal · PayHere │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌──────────┐                                     │
│  │  Resend  │ │  Kafka   │                                     │
│  └──────────┘ └──────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Customer** visits storefront → Clerk handles auth → Supabase serves product data
2. **Cart** is managed client-side via React Context
3. **Checkout** creates a Stripe/PayPal/PayHere session → webhook confirms payment
4. **Order confirmed** → Kafka event published → email worker sends confirmation via Resend
5. **Admin** manages products, orders, banners, and settings through the admin app
6. **Images** upload directly from browser to Supabase Storage via signed URLs

---

## 4. Repository Structure

```
StaticWears/
├── apps/
│   ├── storefront/          # Customer storefront (Next.js, port 3000)
│   └── admin/               # Admin dashboard (Next.js, port 3001)
│
├── packages/
│   ├── shared/              # Types + Supabase clients (shared by all)
│   ├── product-service/     # Product queries & mutations
│   ├── user-service/        # User profile queries & mutations
│   ├── order-service/       # Order queries & mutations
│   ├── payment-service/     # Stripe integration
│   ├── email-service/       # Resend email sending & templates
│   └── kafka/               # Event publishing & workers
│
├── package.json             # Root (Turbo scripts)
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

---

## 5. Applications

### 5.1 Storefront (`apps/storefront`) — Port 3000

The customer-facing Next.js application. All pages use the App Router with server components by default.

**Font setup:**
- `--font-display` → Bebas Neue (bold display headings)
- `--font-mono` → Space Mono (body, labels, prices)

**Theme:** Dark (`#080808` background, `#f0f0f0` text, `#ff6b35` accent orange)

**Global providers (root layout):**
- `ClerkProvider` — auth context
- `CartProvider` — client-side cart state
- `CustomCursor` — branded cursor effect
- `Toaster` (Sonner) — toast notifications
- `BottomNav` — mobile bottom navigation bar

**Key components:**

| Component | Description |
|---|---|
| `Navbar` | Fixed top nav with logo, category links, cart icon, mobile menu |
| `BottomNav` | Mobile-only tab bar (Home · Shop · Cart · Account) |
| `Footer` | Brand column, help links, legal links, social icons (from DB) |
| `MarqueeStrip` | Animated scrolling text banner (text from DB) |
| `BannerSlider` | Full-screen hero image slider with crossfade + progress bar |
| `HeroSection` | Fallback orb-animation hero (shown when no banners set) |
| `ProductCard` | Product listing card with quick-add |
| `ProductDetailClient` | Full product page: thumbnails, variant selector, cart |
| `CartSheet` | Slide-out cart drawer |
| `ImageUploader` | Multi-image upload with Supabase signed URLs |

---

### 5.2 Admin Dashboard (`apps/admin`) — Port 3001

The internal admin panel. Protected by Clerk auth + admin role check on every route.

**Theme:** Dark (`#060608` background, `#e8e8f0` text)

**Fonts:**
- `--font-sans` → Space Grotesk
- `--font-mono` → JetBrains Mono

**Admin role detection:**  
Checks `ADMIN_USER_IDS` env var first, then falls back to `user.publicMetadata.role === 'admin'`.

**Sidebar navigation:**

| Item | Route |
|---|---|
| Dashboard | `/dashboard` |
| Products | `/products` |
| Orders | `/orders` |
| Customers | `/users` |
| Categories | `/categories` |
| Brands | `/brands` |
| Banners | `/banners` |
| Settings | `/settings` |

**Admin pages:**

| Page | Features |
|---|---|
| Dashboard | Revenue stats, order counts, customer count, recent orders, low stock |
| Products | Thumbnail table, stock indicator, delete with confirm modal |
| Products / New | Has-variants toggle, free-text size/colour, per-variant photo, description |
| Products / Edit | Same as New but pre-populated; soft-delete variants |
| Orders | Filter by status, update status inline, export to Excel |
| Customers | Search, role badge (Admin/Customer), export to Excel |
| Banners | Upload full-screen banners, set title/subtitle/CTA, toggle active |
| Settings | Tabbed: Store info · Homepage (marquee, contact) · Social links |

---

## 6. Service Packages

### `@static-wears/shared`

Single source of truth for types and database clients.

**Exports:**

```typescript
// Types
Profile, UserAddress
Category, Brand, Product, ProductVariant, ProductImage
Order, OrderItem, OrderStatus
Payment, PaymentStatus
CartItem, Cart

// Supabase clients
createSupabaseServerClient()    // uses next/headers (server-only)
createSupabaseAdminClient()     // service role key (server-only)
supabase                        // browser anon client
updateSession()                 // middleware session refresh
```

---

### `@static-wears/product-service`

All product-related database operations.

**Queries:**

```typescript
getProducts(filters)            // Paginated, filterable product list
getProductBySlug(slug)          // Single product for storefront
getProductById(id)              // Single product for admin edit
getAllProductsAdmin()            // All products (admin list)
getCategories()                 // All categories
getBrands()                     // All brands
```

**Mutations:**

```typescript
createProduct(data)             // Create with variants + images + categories
updateProduct(id, data)         // Partial update; add/remove images and variants
deleteProduct(id)               // Hard delete (images, variants, categories, product)
updateProductStock(variantId, qty)
decreaseStock(variantId, qty)   // Via Supabase RPC (atomic)
```

---

### `@static-wears/user-service`

User profiles and shipping addresses.

```typescript
getProfile(userId)
updateProfile(userId, data)
getAddresses(userId)
createAddress(userId, data)
updateAddress(addressId, data)
deleteAddress(addressId)
setDefaultAddress(userId, addressId)
```

---

### `@static-wears/order-service`

Order management.

```typescript
createOrder(data)               // Creates order + items, decreases stock
getOrdersByCustomer(userId)
getOrderById(id)
getAllOrders()                   // Admin
updateOrderStatus(id, status)
```

---

### `@static-wears/payment-service`

```typescript
createStripeCheckoutSession(data)
handleStripeWebhook(event)
createPayPalOrder(data)
capturePayPalOrder(orderId)
generatePayHereHash(data)
verifyPayHereNotification(data)
```

---

### `@static-wears/email-service`

```typescript
sendOrderConfirmation(data)     // Sends order confirmation via Resend
sendShippingUpdate(data)        // Sends shipping notification
```

Templates are inline HTML with the Static Wears brand styling.

---

### `@static-wears/kafka`

```typescript
publishEvent(topic, payload)    // Publish event to Kafka
TOPICS.ORDER_PLACED
TOPICS.ORDER_STATUS_CHANGED
```

Workers (`src/workers/email.ts`) consume events and call `email-service` functions.

---

## 7. Database Schema

> Hosted on Supabase (PostgreSQL). Run these if tables are missing.

### Core Tables

```sql
-- Users / Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  district text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Catalogue
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  base_price numeric(10,2) NOT NULL,
  brand_id uuid REFERENCES brands(id),
  status text DEFAULT 'active' CHECK (status IN ('active','draft','inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE product_categories (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  color text,
  price_adj numeric(10,2) NOT NULL,
  stock_qty integer DEFAULT 0,
  sku text,
  image_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  is_main boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  total_amount numeric(10,2) NOT NULL,
  shipping_name text NOT NULL,
  shipping_phone text NOT NULL,
  shipping_addr text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid,
  variant_id uuid,
  product_name text NOT NULL,
  variant_desc text,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL
);

-- Payments
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  provider text NOT NULL,
  provider_ref text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'LKR',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Site Content
CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  cta_text text DEFAULT 'Shop Now',
  cta_link text DEFAULT '/shop',
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
```

### Required SQL Snippets

```sql
-- Stock decrease RPC (atomic)
CREATE OR REPLACE FUNCTION decrease_stock(p_variant_id uuid, p_quantity integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE product_variants
  SET stock_qty = stock_qty - p_quantity
  WHERE id = p_variant_id AND stock_qty >= p_quantity;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
END;
$$;

-- Add description to variants (if upgrading from earlier version)
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS description text;
```

### Storage

- **Bucket name:** `product-images` (public)
- Images uploaded via Supabase signed URLs directly from the browser
- Public URL pattern: `https://<project>.supabase.co/storage/v1/object/public/product-images/<filename>`

---

## 8. API Reference

### Storefront API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List products (filterable) |
| GET | `/api/settings` | Public site settings (marquee, social) |
| POST | `/api/orders` | Create a new order |
| POST | `/api/payments/create-session` | Create Stripe checkout session |
| POST | `/api/payments/webhook` | Stripe webhook handler |
| POST | `/api/payments/paypal/create-order` | Create PayPal order |
| POST | `/api/payments/paypal/capture` | Capture PayPal payment |
| POST | `/api/payments/payhere/hash` | Generate PayHere hash |
| POST | `/api/payments/payhere/notify` | PayHere payment notification |
| GET/POST | `/api/users/profile` | Get/update user profile |

### Admin API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/me` | Current admin user info |
| GET/POST | `/api/admin/products` | List / create products |
| GET/PATCH/DELETE | `/api/admin/products/[id]` | Get / update / delete product |
| PATCH | `/api/admin/orders/[id]` | Update order status |
| GET/POST | `/api/admin/categories` | List / create categories |
| PATCH/DELETE | `/api/admin/categories/[id]` | Update / delete category |
| GET/POST | `/api/admin/brands` | List / create brands |
| PATCH/DELETE | `/api/admin/brands/[id]` | Update / delete brand |
| GET/POST | `/api/admin/banners` | List / create banners |
| PATCH/DELETE | `/api/admin/banners/[id]` | Update / delete banner |
| GET | `/api/admin/upload/sign` | Get Supabase signed upload URL |
| GET/POST | `/api/admin/settings` | Get / upsert site settings |
| GET | `/api/admin/export/orders` | Download orders Excel (.xlsx) |
| GET | `/api/admin/export/users` | Download customers Excel (.xlsx) |

---

## 9. Authentication & Authorisation

### Storefront

- Uses **Clerk** with custom `signInUrl="/login"` and `signUpUrl="/register"`
- Login/Register pages render Clerk's built-in `<SignIn />` and `<SignUp />` components
- Password reset handled by Clerk's built-in flow
- Middleware (`src/middleware.ts`) protects: `/account`, `/orders`, `/checkout`, `/cart`
- Unauthenticated users redirected to `/login?redirect=<original_path>`

### Admin

- Uses the same Clerk instance
- Every admin API route calls `requireAdmin()` which checks:
  1. `ADMIN_USER_IDS` env var (comma-separated Clerk user IDs)
  2. `user.publicMetadata.role === 'admin'`
- If neither matches → `401 Unauthorized`
- The admin app's middleware redirects non-admins to `/login`

---

## 10. Payment Integration

### Stripe (International Cards)

- **Checkout flow:** Create session → redirect to Stripe Hosted Checkout → webhook confirms payment
- **Webhook:** `/api/payments/webhook` verifies signature → updates order status → triggers email
- **Environment:** Supports test mode via `STRIPE_SECRET_KEY` (starts with `sk_test_`)

### PayPal (Wallet + Card)

- **Checkout flow:** Create PayPal order → PayPal JS SDK renders button → capture on approval
- **Endpoints:** `/api/payments/paypal/create-order` → `/api/payments/paypal/capture`
- **Sandbox:** Set `PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com`

### PayHere (Sri Lanka Local Payments)

- **Checkout flow:** Generate hash server-side → submit hidden form to PayHere → receive notification
- **Notification endpoint:** `/api/payments/payhere/notify` verifies MD5 hash
- **Sandbox:** Set `PAYHERE_ENV=sandbox`

---

## 11. File Storage

### Upload Flow

Images no longer pass through the Next.js server (which had a 4MB body limit). Instead:

```
Admin browser
    │
    ├─ 1. GET /api/admin/upload/sign?ext=jpg
    │        ↓
    │  Server creates Supabase signed upload URL
    │        ↓
    │  Returns { signedUrl, url (public) }
    │
    ├─ 2. PUT <signedUrl>  (direct to Supabase Storage, any file size)
    │
    └─ 3. Store returned public URL in DB
```

### Image URL Handling

The `getSupabaseImageUrl(path)` utility in `apps/storefront/src/lib/utils.ts`:
- If `path` starts with `http` → returns as-is (already a full URL from new upload flow)
- Otherwise → prepends `NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/public/product-images/`

This handles both legacy paths and new full URLs transparently.

---

## 12. Email & Events

### Email Service

Emails are sent via **Resend** (`resend@3.2.0`). The `RESEND_API_KEY` env var is required.

Triggered emails:
- **Order Confirmation** — sent when payment is confirmed
- **Shipping Update** — sent when admin changes order status to `shipped`

### Kafka Event Bus

Used for async decoupling between payment confirmation and email sending.

**Topics:**
- `order.placed` — published when an order is confirmed
- `order.status.changed` — published when admin updates order status

**Worker:** Run `pnpm email-worker` in the `kafka` package to start consuming events.

---

## 13. Environment Variables

### Storefront (`apps/storefront/.env.local`)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# PayHere
NEXT_PUBLIC_PAYHERE_MERCHANT_ID=...
PAYHERE_MERCHANT_SECRET=...
PAYHERE_ENV=sandbox

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001

# Admin IDs
ADMIN_USER_IDS=user_xxxx,user_yyyy
```

### Admin (`apps/admin/.env.local`)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin IDs
ADMIN_USER_IDS=user_xxxx,user_yyyy
```

---

## 14. Running Locally

### Prerequisites

- Node.js 18+
- pnpm 9+
- A Supabase project
- A Clerk application

### Install

```bash
git clone https://github.com/chamiduuuu/staticwearslk.git
cd StaticWears
pnpm install
```

### Setup

1. Copy env files and fill in your keys:
   ```bash
   cp .env.example apps/storefront/.env.local
   cp .env.example apps/admin/.env.local
   ```

2. Run the SQL schema in your Supabase SQL editor (see Section 7)

3. Create a `product-images` public storage bucket in Supabase

### Run both apps

```bash
pnpm dev          # Runs storefront :3000 + admin :3001 via Turbo
```

### Run individually

```bash
cd apps/storefront && pnpm dev   # Storefront only
cd apps/admin && pnpm dev        # Admin only
```

### Build

```bash
pnpm build        # Builds both apps
```

### Type-check

```bash
cd apps/storefront && node ../../node_modules/typescript/bin/tsc --noEmit
cd apps/admin     && node ../../node_modules/typescript/bin/tsc --noEmit
```

---

## 15. Key Features

### Storefront

| Feature | Detail |
|---|---|
| Hero Banner Slider | Full-screen image carousel with crossfade, dot nav, progress bar, auto-advance |
| Product Listing | Filterable by category + sortable, mobile chip filters, 2-col grid |
| Product Detail | Thumbnail strip (all variant + product photos), live image switching per variant |
| Variant System | Free-text size/colour, per-variant price, stock, SKU, description, photo |
| Cart | Client-side state, slide-out drawer, quantity controls |
| Checkout | Stripe · PayPal · PayHere — all in one page |
| Orders | Full order history with status badges |
| Account | Profile card with stats, recent orders, quick links |
| Info Pages | Size Guide · Returns · Shipping · Contact · Privacy · Terms |
| Mobile Nav | Fixed bottom tab bar (Home · Shop · Cart · Account) |
| Responsive | Mobile-first, works on all screen sizes |

### Admin Dashboard

| Feature | Detail |
|---|---|
| Dashboard | Revenue, order and customer counts, charts, low stock alerts |
| Products | Thumbnail table with stock level indicator |
| Product Form | Has-Variants toggle, free-text variants, per-variant images, description |
| Image Upload | Direct to Supabase Storage via signed URL (no server body limit) |
| Banners | Upload and manage full-screen hero banners with CTA |
| Orders | Filter by status, inline status update, Excel export |
| Customers | Search, role badge, Excel export |
| Excel Export | Orders: 2-sheet xlsx (Summary + Line Items). Customers: 2-sheet xlsx |
| Settings | Marquee text, contact info, social links — all editable via admin |
| Delete | Hard delete with confirmation modal |

---

## 16. Pages Reference

### Storefront

| URL | Page | Auth |
|---|---|---|
| `/` | Homepage (banner slider, featured products, manifesto) | No |
| `/shop` | Product listing with filters | No |
| `/products/[slug]` | Product detail with variant selector | No |
| `/cart` | Shopping cart | No |
| `/checkout` | Multi-gateway checkout | Yes |
| `/orders` | Order history | Yes |
| `/orders/[id]` | Order detail | Yes |
| `/account` | Account overview | Yes |
| `/login` | Sign in | No |
| `/register` | Sign up | No |
| `/size-guide` | Size chart + measurement guide | No |
| `/returns` | Returns & exchange policy | No |
| `/shipping` | Shipping zones & rates | No |
| `/contact` | Contact form + info | No |
| `/privacy` | Privacy policy | No |
| `/terms` | Terms of service | No |

### Admin

| URL | Page |
|---|---|
| `/dashboard` | Overview stats |
| `/products` | Products list |
| `/products/new` | Create product |
| `/products/[id]/edit` | Edit product |
| `/orders` | Orders list |
| `/users` | Customers list |
| `/categories` | Categories CRUD |
| `/brands` | Brands CRUD |
| `/banners` | Banner slider management |
| `/settings` | Site-wide settings |

---

## Git Repository

**GitHub:** `https://github.com/chamiduuuu/staticwearslk`  
**Branch:** `main`  
**Commits:** See `git log --oneline` for full history

---

*Static Wears · HND Dissertation 2026 · Built with Next.js, Supabase & Clerk*
