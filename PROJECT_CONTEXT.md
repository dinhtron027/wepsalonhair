# Project Overview
- Name: salon-root / Salon Duong Chi
- Goal: Full-stack salon website with customer-facing booking/e-commerce flows and admin operations.
- Description: React frontend and Express/MongoDB backend for salon services, products, bookings, cart, orders, inventory, customers, revenue stats, auth, and realtime admin updates.

# Current Status
- Development stage: MVP/full-stack application with public site and admin dashboard.
- Progress: Core public pages, auth, booking, product, cart, order, admin management, inventory, and realtime sync are implemented.
- Overall state: Locally runnable. Latest local checks passed: lint, TypeScript check, production build, backend syntax check, backend app load, root/frontend npm audit.

# Tech Stack
## Frontend
- React 18
- TypeScript
- Vite 8
- Tailwind CSS
- React Router DOM 6
- TanStack React Query
- Zustand
- Axios
- Socket.IO Client
- Framer Motion
- Lucide React
- Swiper
- React Big Calendar
- React Hot Toast

## Backend
- Node.js
- Express 5
- Mongoose
- Socket.IO
- Joi validation
- JWT authentication
- bcryptjs password hashing
- Helmet
- CORS
- Nodemailer
- Google Auth Library
- Axios

## Database
- MongoDB
- Mongoose models: User, Service, Product, Booking, Cart, Order, InventoryTransaction

## Infrastructure
- Node HTTP server
- Express API under `/api`
- Socket.IO realtime server
- MongoDB connection through `MONGODB_URI`

## CI/CD
- Unknown

## Cloud
- Unknown
- `frontend/.env.production` references `https://salonduongchi.online`.

## External Services
- Google OAuth
- Facebook OAuth
- SMTP email via Nodemailer
- Zalo webhook integration variables exist
- Payment provider config for `cash`, `momo`, `vnpay`
- Current payment implementation creates mock checkout metadata/URLs

# Architecture

## System Design
- Monorepo-style project with root backend scripts and separate `frontend/` app.
- Backend flow: `routes -> middleware -> controllers -> services -> models`.
- Frontend flow: `App.tsx -> routes/layouts/pages -> services/hooks/stores -> API`.
- Admin routes are protected by JWT and role `admin`.
- Some booking routes allow `staff` as well as `admin`.
- Public frontend uses `MainLayout`; `/admin` uses `AdminLayout` and `ProtectedRoute`.
- React Query handles server state; Socket.IO invalidates related query keys for realtime admin/public updates.
- Vite uses `manualChunks` to split large vendor bundles.

## Main Components
- Frontend public pages: Home, About, Services, Service Detail, Pricing, Products, Product Detail, Gallery, Booking, News, Contact, Cart, Login.
- Frontend admin pages: Dashboard, Bookings, Services, Products, Orders, Customers, Inventory.
- Backend modules: auth, services, products, bookings, cart, orders, admin, inventory, notifications, email, payment, realtime socket.
- Shared backend utilities: env validation, request validation, API responses, error handling, async handler, date helpers, security helpers.

## Data Flow
- Frontend API client reads `VITE_API_URL`; defaults to `http://localhost:5000` in dev.
- Axios request interceptor attaches `Authorization: Bearer <token>` from localStorage.
- Backend validates env with Joi, connects to MongoDB, registers Express routes, starts Socket.IO.
- Controllers return a response envelope through `sendSuccess`.
- Frontend `extractApiData` accepts either enveloped `{ data }` responses or raw payloads.
- Admin realtime events invalidate React Query caches by resource.

# Folder Structure

```text
project/
├── app.js
├── package.json
├── package-lock.json
├── PROJECT_CONTEXT.md
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   ├── entity/repositories/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── shared/errors/
│   ├── socket/
│   └── utils/
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── public/
    └── src/
        ├── app/control/di/
        ├── components/
        ├── constant/
        ├── features/
        ├── hooks/
        ├── layouts/
        ├── modules/
        ├── pages/
        │   └── admin/
        ├── routes/
        ├── services/
        ├── shared/
        └── store/
```

# Environment Variables

| Variable | Description |
| -------- | ----------- |
| NODE_ENV | Backend environment: `development`, `test`, or `production`. |
| PORT | Backend port, default `5000`. |
| MONGODB_URI | MongoDB connection string. |
| JWT_SECRET | Secret for signing JWT tokens; minimum 16 chars. |
| JWT_EXPIRES_IN | JWT expiration, default `7d`. |
| FRONTEND_URL | Comma-separated allowed frontend origins for CORS and Socket.IO. |
| SMTP_HOST | SMTP host for email. |
| SMTP_PORT | SMTP port, default `587`. |
| SMTP_USER | SMTP username. |
| SMTP_PASS | SMTP password. |
| EMAIL_FROM | Sender label/address for email. |
| ZALO_WEBHOOK_URL | Optional Zalo webhook URL. |
| ZALO_ACCESS_TOKEN | Optional Zalo access token. |
| PAYMENT_PROVIDER | `cash`, `momo`, or `vnpay`; default `cash`. |
| VNPAY_TMN_CODE | VNPay terminal code. |
| VNPAY_HASH_SECRET | VNPay hash secret. |
| MOMO_PARTNER_CODE | Momo partner code. |
| MOMO_ACCESS_KEY | Momo access key. |
| MOMO_SECRET_KEY | Momo secret key. |
| DEFAULT_ADMIN_NAME | Seed admin name. |
| DEFAULT_ADMIN_EMAIL | Seed admin email. |
| DEFAULT_ADMIN_PHONE | Seed admin phone. |
| DEFAULT_ADMIN_PASSWORD | Seed admin password. |
| DEFAULT_STAFF_EMAIL | Seed staff email. |
| DEFAULT_STAFF_PHONE | Seed staff phone. |
| DEFAULT_STAFF_PASSWORD | Seed staff password. |
| DEFAULT_CUSTOMER_EMAIL | Seed customer email. |
| DEFAULT_CUSTOMER_PHONE | Seed customer phone. |
| DEFAULT_CUSTOMER_PASSWORD | Seed customer password. |
| GOOGLE_CLIENT_ID | Backend Google OAuth client id used by Google Auth Library. |
| VITE_API_URL | Frontend API base URL. |
| VITE_GOOGLE_CLIENT_ID | Frontend Google OAuth client id. |
| GOOGLE_CLIENT_SECRET | Present in local env; usage in source Unknown; do not expose client-side. |

# Database Schema

## Table: Users

* Purpose: Store accounts for customers, staff, and admins.
* Fields: `_id`, `name`, `phone`, `email`, `role`, `password`, `provider`, `googleId`, `facebookId`, `avatar`, `createdAt`, `updatedAt`.

## Table: Services

* Purpose: Store salon services, addons, discounts, and time-based pricing rules.
* Fields: `_id`, `name`, `category`, `price`, `discount`, `description`, `image`, `durationMinutes`, `addons[]`, `pricingRules[]`, `createdAt`, `updatedAt`.

## Table: Products

* Purpose: Store shop products and stock levels.
* Fields: `_id`, `name`, `price`, `description`, `stock`, `lowStockThreshold`, `image`, `category`, `isActive`, `createdAt`, `updatedAt`.

## Table: Bookings

* Purpose: Store salon appointments.
* Fields: `_id`, `userId`, `customerName`, `phone`, `email`, `serviceId`, `serviceName`, `stylist`, `date`, `time`, `addOns[]`, `totalPrice`, `baseServicePrice`, `serviceDiscountPercent`, `pricingRuleLabel`, `status`, `hairColorUsed`, `note`, `createdAt`, `updatedAt`.
* Indexes: Unique `{ date, time }` for active statuses `pending`, `confirmed`, `in_service`.

## Table: Carts

* Purpose: Store one cart per user.
* Fields: `_id`, `userId`, `items[]`, `totalItems`, `subtotal`, `createdAt`, `updatedAt`.

## Table: Orders

* Purpose: Store product orders and payment state.
* Fields: `_id`, `userId`, `products[]`, `totalPrice`, `status`, `note`, `payment.provider`, `payment.status`, `payment.checkoutUrl`, `payment.metadata`, `createdAt`, `updatedAt`.

## Table: InventoryTransactions

* Purpose: Store stock import/export history.
* Fields: `_id`, `productId`, `type`, `quantity`, `previousStock`, `newStock`, `note`, `createdBy`, `createdAt`, `updatedAt`.
* Indexes: `{ productId: 1, createdAt: -1 }`.

# API Endpoints

## Endpoint

* Method: GET
* URL: `/api/health`
* Description: Backend health check.

## Endpoint

* Method: POST
* URL: `/api/auth/register`
* Description: Register customer account.

## Endpoint

* Method: POST
* URL: `/api/auth/login`
* Description: Login with email/phone identifier and password.

## Endpoint

* Method: POST
* URL: `/api/auth/google`
* Description: Login/register with Google id token.

## Endpoint

* Method: POST
* URL: `/api/auth/facebook`
* Description: Login/register with Facebook access token.

## Endpoint

* Method: GET
* URL: `/api/services`
* Description: Public list of services.

## Endpoint

* Method: GET
* URL: `/api/services/:id`
* Description: Public service detail by Mongo id.

## Endpoint

* Method: GET
* URL: `/api/products`
* Description: Public list of active products.

## Endpoint

* Method: GET
* URL: `/api/products/:id`
* Description: Public product detail by Mongo id.

## Endpoint

* Method: POST
* URL: `/api/bookings`
* Description: Create booking; auth optional.

## Endpoint

* Method: GET
* URL: `/api/bookings/slots?date=YYYY-MM-DD`
* Description: Get booked slots for a date.

## Endpoint

* Method: GET
* URL: `/api/bookings`
* Description: List bookings; requires `admin` or `staff`.

## Endpoint

* Method: PUT
* URL: `/api/bookings/:id`
* Description: Update booking status/details; requires `admin` or `staff`.

## Endpoint

* Method: DELETE
* URL: `/api/bookings/:id`
* Description: Cancel booking; requires auth.

## Endpoint

* Method: GET
* URL: `/api/cart`
* Description: Get current user's cart; requires `customer` or `admin`.

## Endpoint

* Method: POST
* URL: `/api/cart/items`
* Description: Add product to cart; requires `customer` or `admin`.

## Endpoint

* Method: PUT
* URL: `/api/cart/items/:productId`
* Description: Update cart item quantity; requires `customer` or `admin`.

## Endpoint

* Method: DELETE
* URL: `/api/cart/items/:productId`
* Description: Remove cart item; requires `customer` or `admin`.

## Endpoint

* Method: POST
* URL: `/api/orders`
* Description: Create order from products/payment payload; requires auth.

## Endpoint

* Method: GET
* URL: `/api/orders`
* Description: List orders visible to current user; requires auth.

## Endpoint

* Method: GET
* URL: `/api/orders/:id`
* Description: Get order detail; requires auth.

## Endpoint

* Method: GET
* URL: `/api/admin/bookings`
* Description: Admin list bookings.

## Endpoint

* Method: PATCH
* URL: `/api/admin/bookings/:id`
* Description: Admin update booking.

## Endpoint

* Method: GET
* URL: `/api/admin/services`
* Description: Admin list services.

## Endpoint

* Method: POST
* URL: `/api/admin/services`
* Description: Admin create service.

## Endpoint

* Method: PUT
* URL: `/api/admin/services/:id`
* Description: Admin update service.

## Endpoint

* Method: DELETE
* URL: `/api/admin/services/:id`
* Description: Admin delete service.

## Endpoint

* Method: GET
* URL: `/api/admin/products`
* Description: Admin list products.

## Endpoint

* Method: POST
* URL: `/api/admin/products`
* Description: Admin create product.

## Endpoint

* Method: PUT
* URL: `/api/admin/products/:id`
* Description: Admin update product.

## Endpoint

* Method: DELETE
* URL: `/api/admin/products/:id`
* Description: Admin delete product.

## Endpoint

* Method: GET
* URL: `/api/admin/orders`
* Description: Admin list orders.

## Endpoint

* Method: GET
* URL: `/api/admin/customers`
* Description: Admin customer overview.

## Endpoint

* Method: GET
* URL: `/api/admin/inventory`
* Description: Admin inventory overview.

## Endpoint

* Method: POST
* URL: `/api/admin/inventory/adjust`
* Description: Admin import/export stock.

## Endpoint

* Method: GET
* URL: `/api/admin/stats/revenue`
* Description: Admin revenue and booking statistics.

# Features Completed

* Public website routes and layouts.
* Admin dashboard routes and protected admin layout.
* Local JWT auth with role-based authorization.
* Google and Facebook auth endpoints.
* Service/product listing and admin CRUD.
* Booking creation, slot lookup, status updates, cancellation.
* Cart management.
* Order creation and order listing/detail.
* Inventory overview and stock adjustment.
* Revenue statistics endpoint.
* Realtime Socket.IO events and React Query invalidation.
* Seed script for services, products, admin, staff, and customer.
* Vite vendor chunk splitting.
* Dependency security audit currently clean.

# Features In Progress

* Unknown

# Planned Features

* Unknown

# Pending Tasks

* Add automated tests.
* Add CI/CD configuration.
* Add deployment configuration if deployment target is chosen.
* Rotate/remove any exposed OAuth secrets from frontend env files.
* Review `react-facebook-login` compatibility before React upgrades.
* Remove or refresh stale diagnostic file `frontend/lint_output.txt`.
* Document production deployment steps once finalized.

# Deployment

## Docker

* Unknown

## Docker Compose

* Unknown

## GitHub Actions

* Unknown

## Nginx

* Unknown

## Domain

* `salonduongchi.online` is referenced by `frontend/.env.production`.

## SSL

* Unknown

# Coding Conventions

## Naming Rules

* Backend filenames use camelCase for controllers/services/middleware/utilities.
* Backend Mongoose models use PascalCase filenames.
* Frontend React components/pages use PascalCase filenames.
* Frontend hooks use `useX` naming.
* Frontend API service files use camelCase.

## Commit Convention

* Unknown

## Folder Convention

* Active backend code belongs in `backend/routes`, `backend/controllers`, `backend/services`, `backend/models`, `backend/middleware`, `backend/utils`.
* Do not reintroduce removed backend legacy `boundary/control` architecture unless intentionally migrating the full backend.
* Frontend admin pages live under `frontend/src/pages/admin`.
* Auth and product public pages currently use `frontend/src/modules/*` through re-export pages.
* Generated assets live in `frontend/dist`; do not edit generated output.

## Best Practices

* Use Joi schemas and `validateRequest` for backend request validation.
* Use `asyncHandler` for async Express controllers.
* Return consistent API envelopes through response helpers.
* Keep role checks in middleware.
* Use typed frontend API helpers in `frontend/src/services`.
* Use React Query for server state, not duplicated local state.
* Keep secrets out of frontend env unless variable starts with `VITE_` and is safe to expose.
* Run lint, TypeScript check, build, and audit after dependency or architecture changes.

# Important Decisions

* Active backend architecture is `routes -> controllers -> services -> models`.
* Legacy backend `boundary/control` files were removed because app routes did not use them.
* Legacy frontend admin pages `AdminPage.tsx` and `AdminDashboard.tsx` were removed because `/admin` uses `frontend/src/pages/admin/*`.
* Admin access is restricted to role `admin`; selected booking routes also allow `staff`.
* JWT token is sent by frontend Axios through `Authorization: Bearer <token>`.
* Socket.IO supports guest sockets but joins role rooms when JWT is valid.
* Realtime events invalidate React Query cache keys instead of manually mutating all UI state.
* Vite `manualChunks` is used to prevent oversized production JS chunks.
* Payment providers are currently mocked by backend metadata/checkout URLs.

# Known Issues

* No automated test suite is configured.
* `react-facebook-login@4.1.1` has old React peer expectations; installs require `--legacy-peer-deps`.
* Local env files include sensitive OAuth values; secrets should be rotated and removed from client-visible env.
* `frontend/lint_output.txt` appears stale and does not represent current lint status.
* PowerShell may display Vietnamese UTF-8 text as mojibake; avoid rewriting copy-only text unless needed.
* Git repository may be rooted above `salon`; use path-scoped git commands to avoid unrelated files.

# Security Notes

* Secrets location: root `.env`, `frontend/.env`, deployment environment variables.
* Environment files: `.env.example` is safe template; `.env` and `frontend/.env` must not be committed with real secrets.
* Authentication: JWT signed with `JWT_SECRET`; local passwords hashed with bcryptjs; Google/Facebook OAuth supported.
* Authorization: role middleware supports `admin`, `staff`, `customer`; admin API requires `admin`.
* CORS: allowed origins from `FRONTEND_URL`, loopback origins allowed.
* Socket auth: accepts token via handshake auth, Authorization header, or query token; invalid/missing token becomes guest.
* Audits: root and frontend `npm audit --audit-level=moderate` passed with 0 vulnerabilities after dependency updates.

# Dependencies

* Root/backend runtime: express, mongoose, socket.io, joi, jsonwebtoken, bcryptjs, cors, helmet, dotenv, nodemailer, google-auth-library, axios, zustand, react-hot-toast, react-big-calendar.
* Root dev: concurrently.
* Frontend runtime: react, react-dom, react-router-dom, @tanstack/react-query, axios, zustand, socket.io-client, framer-motion, lucide-react, swiper, date-fns, react-big-calendar, react-hot-toast, @react-oauth/google, react-facebook-login.
* Frontend dev: vite, @vitejs/plugin-react, typescript, eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, tailwindcss, postcss, autoprefixer.

# Commands

## Run project

```bash
npm install
npm install --prefix frontend
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm run lint
cd frontend && npx tsc --noEmit
npm audit --audit-level=moderate
npm audit --prefix frontend --audit-level=moderate
```

## Deploy

```bash
Unknown
```

# Next Steps

1. Rotate/remove exposed OAuth secrets and keep real secrets only in server/deployment env.
2. Add automated tests and CI checks for lint, typecheck, build, audit, and backend smoke load.
3. Define production deployment target and document Docker/Nginx/domain/SSL or provider-specific setup.

# AI Notes

Những điều AI tương lai cần biết:

* Prefer the active backend stack in `backend/routes`, `controllers`, `services`, `models`.
* Do not restore deleted legacy admin pages or backend `boundary/control` files unless explicitly requested.
* Use `--legacy-peer-deps` when npm install hits the existing `react-facebook-login` peer conflict.
* Do not print or copy real values from `.env` files into docs or chat.
* Before changing UI routes, check `frontend/src/App.tsx` and `frontend/src/routes/index.tsx`.
* Before changing admin API types, check `frontend/src/services/adminApi.ts`.
* Before changing realtime behavior, update both `backend/socket/io.js` and `frontend/src/services/socket.ts`.
* For local verification, run lint, typecheck, build, backend syntax check, backend app load, and npm audit.
