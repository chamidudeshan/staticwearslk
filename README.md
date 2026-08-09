# Static Wears

### Premium Sri Lankan Streetwear E-Commerce Platform

Static Wears is a full-stack e-commerce platform built for a premium Sri Lankan streetwear brand. The project was developed as my HND Dissertation Project at Hardy ATI Sri Lanka.

The platform provides a complete shopping experience, including product browsing, product variants, cart management, multiple payment methods, order tracking, and customer accounts. It also includes a separate admin dashboard for managing products, orders, customers, banners, categories, brands, and site settings.

## Features

### Customer Storefront

* Product browsing with category filtering and sorting
* Product details with size and colour variants
* Variant-specific pricing, stock, SKU, and images
* Client-side shopping cart
* Stripe, PayPal, and PayHere checkout
* Customer accounts and profiles
* Order history and order tracking
* Responsive design for desktop and mobile
* Size guide, shipping, returns, privacy, and terms pages

### Admin Dashboard

* Dashboard with sales and order statistics
* Product and variant management
* Category and brand management
* Order management and status updates
* Customer management
* Homepage banner management
* Store and social media settings
* Excel export for orders and customers
* Direct product image uploads to Supabase Storage

## Tech Stack

| Technology   | Usage                                |
| ------------ | ------------------------------------ |
| Next.js      | Frontend and application framework   |
| TypeScript   | Application development              |
| Tailwind CSS | Styling                              |
| Supabase     | PostgreSQL database and file storage |
| Clerk        | Authentication                       |
| Stripe       | Card payments                        |
| PayPal       | Online payments                      |
| PayHere      | Sri Lankan payments                  |
| Kafka        | Event-driven communication           |
| Resend       | Transactional emails                 |
| Turborepo    | Monorepo management                  |
| pnpm         | Package management                   |
| Radix UI     | UI components                        |
| Recharts     | Dashboard charts                     |

## Architecture

The project uses a microservices-inspired monorepo structure with separate applications for the customer storefront and admin dashboard.

```text
Static Wears
│
├── apps/
│   ├── storefront/       # Customer-facing application
│   └── admin/            # Admin dashboard
│
├── packages/
│   ├── shared/           # Shared types and database clients
│   ├── product-service/  # Product operations
│   ├── user-service/     # User operations
│   ├── order-service/    # Order operations
│   ├── payment-service/  # Payment integrations
│   ├── email-service/    # Email service
│   └── kafka/            # Event publishing and workers
│
└── ...
```

### Main Data Flow

```text
Customer
   ↓
Storefront
   ↓
Authentication / Database
   ↓
Cart
   ↓
Payment Gateway
   ↓
Order
   ↓
Kafka Events
   ↓
Email Service
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js 18+
* pnpm 9+
* A Supabase project
* A Clerk application

### Installation

Clone the repository:

```bash
git clone https://github.com/chamiduuuu/staticwearslk.git
cd StaticWears
```

Install dependencies:

```bash
pnpm install
```

Create the required environment files and add your credentials:

```text
apps/storefront/.env.local
apps/admin/.env.local
```

Refer to `.env.example` for the required environment variables.

### Run the Project

To run both applications:

```bash
pnpm dev
```

The applications will be available at:

```text
Storefront: http://localhost:3000
Admin:      http://localhost:3001
```

## Documentation

For the complete technical documentation, including:

* Database schema
* API reference
* Authentication and authorisation
* Payment integrations
* File storage
* Kafka events
* Environment variables
* Service packages
* Application structure
* Detailed feature documentation

see [DOCUMENTATION.md](DOCUMENTATION.md).

## Project Status

This project was developed as an HND Dissertation Project and is continuously improved as part of my development journey.

## Author

**Chamidu Jayaneththi**

Hardy ATI Sri Lanka
HND Dissertation Project — 2026

GitHub: https://github.com/chamiduuuu

---

Built with Next.js, Supabase, Clerk, and TypeScript.
