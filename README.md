# Gupta Medicine Centre - Admin Dashboard

A comprehensive admin dashboard for managing the Gupta Medicine Centre pharmacy. Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and integrated with a **FastAPI** backend.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Pages & Functionality](#pages--functionality)
- [API Integration](#api-integration)
- [Real-time Features](#real-time-features)
- [Authentication](#authentication)
- [Component Library](#component-library)

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | Overview stats, order status distribution chart, recent activity feed |
| **Categories** | Full CRUD, toggle active/inactive, sort ordering, image support |
| **Medicines** | CRUD with image upload, stock management, low-stock alerts, category filtering, pagination |
| **Orders** | List with filters, status workflow (pending → confirmed → processing → shipped → delivered), order detail view |
| **Users** | List with role/search filters, edit user details, role management, activate/deactivate |
| **Prescriptions** | Review workflow (approve/reject), OCR text display, prescription image viewer |
| **Chat** | Real-time messaging via Socket.IO, file/image upload, typing indicators, WebRTC audio/video calls |
| **Payments** | Payment listing with filters, refund processing with reason modal |
| **Coupons** | CRUD, percentage/fixed discounts, usage limits, validity dates |
| **Delivery** | Agent management (CRUD, availability toggle), delivery zone management (CRUD with pricing) |
| **Inventory** | Batch tracking, supplier management (CRUD), expiry alerts with countdown, purchase orders |
| **Notifications** | Send to individual users or broadcast to all, multiple notification types |
| **Analytics** | Revenue overview with charts, daily sales reports, generate on-demand reports, drug interaction management |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS with custom green theme |
| State Management | Zustand (persisted to localStorage) |
| HTTP Client | Axios with JWT interceptors |
| Real-time | Socket.IO Client |
| Video/Audio Calls | WebRTC with Google STUN servers |
| Charts | Recharts (Line, Bar, Pie) |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Forms | React Hook Form + Zod (available) |

---

## Project Structure

```
web/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (fonts, toaster)
│   │   ├── page.tsx                  # Redirects to /dashboard
│   │   ├── globals.css               # Tailwind + custom component styles
│   │   ├── login/page.tsx            # Admin login page
│   │   └── dashboard/
│   │       ├── layout.tsx            # Dashboard layout wrapper
│   │       ├── page.tsx              # Main dashboard with stats & charts
│   │       ├── categories/page.tsx   # Category management (NEW)
│   │       ├── medicines/page.tsx    # Medicine management + images
│   │       ├── orders/page.tsx       # Order management
│   │       ├── users/page.tsx        # User management + editing
│   │       ├── prescriptions/page.tsx# Prescription review
│   │       ├── chat/page.tsx         # Chat support + file upload
│   │       ├── payments/page.tsx     # Payment management + refunds
│   │       ├── coupons/page.tsx      # Coupon management
│   │       ├── delivery/page.tsx     # Delivery agents & zones
│   │       ├── inventory/page.tsx    # Batches, suppliers, POs, expiry
│   │       ├── notifications/page.tsx# Send notifications
│   │       └── analytics/page.tsx    # Revenue, reports, interactions
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Navigation sidebar (collapsible)
│   │   │   ├── Header.tsx            # Top bar with search & profile
│   │   │   └── DashboardLayout.tsx   # Auth guard + layout wrapper
│   │   ├── ui/
│   │   │   ├── DataTable.tsx         # Generic data table with skeleton
│   │   │   ├── StatsCard.tsx         # Dashboard stat card with icon
│   │   │   ├── Modal.tsx             # Modal dialog (escape/overlay close)
│   │   │   ├── Badge.tsx             # Color-coded status badge
│   │   │   ├── Pagination.tsx        # Page navigation with ellipsis
│   │   │   └── LoadingSpinner.tsx    # Animated loading spinner
│   │   └── call/
│   │       └── CallModal.tsx         # WebRTC call UI (audio/video)
│   │
│   ├── services/                     # API service layer
│   │   ├── auth.service.ts           # Login, profile
│   │   ├── dashboard.service.ts      # Dashboard stats
│   │   ├── category.service.ts       # Category CRUD (NEW)
│   │   ├── medicine.service.ts       # Medicine CRUD + stock + low-stock
│   │   ├── order.service.ts          # Orders + status updates
│   │   ├── user.service.ts           # User management + role editing
│   │   ├── prescription.service.ts   # Prescription review
│   │   ├── payment.service.ts        # Payments + refunds
│   │   ├── coupon.service.ts         # Coupon CRUD
│   │   ├── delivery.service.ts       # Agents + zones + assign + complete
│   │   ├── inventory.service.ts      # Batches + suppliers + POs + expiry
│   │   ├── analytics.service.ts      # Revenue, reports, interactions (NEW)
│   │   ├── chat.service.ts           # Chat rooms + messages + read
│   │   └── notification.service.ts   # Send notifications
│   │
│   ├── hooks/
│   │   └── useApi.ts                 # Custom data fetching + submit hooks
│   │
│   ├── lib/
│   │   ├── api.ts                    # Axios instance with JWT interceptors
│   │   ├── utils.ts                  # cn(), formatCurrency, formatDate, etc.
│   │   ├── socket.ts                 # Socket.IO client manager
│   │   └── webrtc.ts                 # WebRTC call manager
│   │
│   ├── store/
│   │   └── auth.ts                   # Zustand auth store (persist)
│   │
│   └── types/
│       └── index.ts                  # All TypeScript interfaces
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── postcss.config.js
└── .env.local
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at `http://localhost:8000`

### Installation

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

Dashboard runs at **http://localhost:3000**.

### Production Build

```bash
npm run build
npm start
```

### Backend

Make sure the FastAPI backend is running:

```bash
# From the project root (raju/)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs at: http://localhost:8000/docs

---

## Environment Variables

Create `.env.local` in the `web/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for Socket.IO | `ws://localhost:8000` |

---

## Architecture

### How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Pages      │ ──> │   Services   │ ──> │   API (Axios) │ ──> Backend
│  (React UI)  │ <── │  (Business)  │ <── │  (HTTP/WS)    │ <── FastAPI
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       ├── Components (Reusable UI)              ├── Auth Interceptors
       ├── Hooks (Data fetching)                 ├── Token Refresh
       ├── Store (Zustand state)                 └── Socket.IO
       └── Types (TypeScript)
```

### Data Flow

1. **Pages** call **Services** to fetch/mutate data
2. **Services** use the **API client** (Axios) to make HTTP requests
3. **API client** automatically attaches auth tokens and handles 401 refresh
4. **Zustand store** persists auth state to localStorage
5. **Socket.IO** handles real-time chat and call events

### Service Layer Pattern

Each service file encapsulates all API calls for a domain:

```typescript
// Example: services/medicine.service.ts
export const medicineService = {
  getAll: async (params)     => { /* GET  /api/admin/medicines */ },
  create: async (data)       => { /* POST /api/admin/medicines */ },
  update: async (id, data)   => { /* PUT  /api/admin/medicines/{id} */ },
  delete: async (id)         => { /* DELETE /api/admin/medicines/{id} */ },
  updateStock: async (id, q) => { /* PUT  /api/admin/medicines/{id}/stock */ },
  getLowStock: async (t)     => { /* GET  /api/admin/medicines/low-stock */ },
};
```

### Custom Hooks (`hooks/useApi.ts`)

```typescript
// useApi - Auto-fetching with loading/error states
const { data, loading, error, reload } = useApi(
  () => medicineService.getAll({ page }),
  [page]
);

// useSubmit - For form submissions with toast feedback
const { execute, loading } = useSubmit(
  (data) => medicineService.create(data),
  { successMessage: "Medicine created" }
);
```

---

## Pages & Functionality

### Login (`/login`)
- Email/password authentication
- Admin-only role verification (non-admin users rejected)
- JWT tokens stored with auto-refresh capability

### Dashboard (`/dashboard`)
- **8 stat cards**: total users, orders, revenue, medicines, pending orders, prescriptions, low stock, categories
- **Order status pie chart** with color-coded segments
- **Recent activity feed** showing latest orders, users, prescriptions

### Categories (`/dashboard/categories`) - NEW
- Full CRUD: create, read, update, delete (soft-delete)
- Image URL support for category icons
- Sort ordering for display priority
- Toggle active/inactive status inline
- Counter showing active vs total categories

### Medicines (`/dashboard/medicines`) - ENHANCED
- **All Medicines tab**: search, category filter, server-side pagination
- **Low Stock tab**: highlights medicines below threshold (default: 10)
- **Image upload**: file picker with preview for medicine photos
- **Quick stock update**: click stock number to open stock edit modal
- Full form with all fields: name, generic name, manufacturer, category, price, discount%, stock, dosage form, strength, pack size, description, side effects, prescription required

### Orders (`/dashboard/orders`) - ENHANCED
- Filter by status, search by order number, pagination
- Status workflow buttons: Confirm → Process → Ship → Deliver
- Order detail modal: customer info, items with pricing, delivery address, notes
- Cancel order capability from any non-terminal state
- Improved status transition UX with clear action buttons

### Users (`/dashboard/users`) - ENHANCED
- Filter by role (customer, admin, pharmacist, delivery, finance)
- Search by name/email, pagination
- **Edit user modal**: change name, phone, role, active status
- Quick toggle activate/deactivate from table
- User avatar initials display

### Prescriptions (`/dashboard/prescriptions`)
- Filter by status (pending/approved/rejected), pagination
- View full prescription image in modal
- OCR extracted text display in monospace
- Approve/reject with optional admin notes
- Quick approve/reject buttons in table row
- Pending count badge in header

### Chat (`/dashboard/chat`) - ENHANCED
- Split layout: conversation list (with avatars) + chat area
- **Real-time messaging** via Socket.IO
- **File/image upload** via REST API with progress indicator
- **Typing indicators** with auto-timeout
- **Mark as read** on room select
- Unread message count badges
- Audio/video call buttons (WebRTC integration)
- Connection status indicator (connected/disconnected)
- Support for image, file, and prescription message types

### Payments (`/dashboard/payments`) - ENHANCED
- Filter by status, pagination
- **Refund modal** with required reason text (not just prompt)
- Payment summary display before refund confirmation
- Transaction ID display

### Coupons (`/dashboard/coupons`)
- Full CRUD operations
- Discount types: percentage or fixed amount
- Usage limits (total and per-user)
- Validity date range picker
- Auto-uppercase coupon codes

### Delivery (`/dashboard/delivery`) - ENHANCED
- **Agents tab**: CRUD with edit modal, toggle availability inline, rating display with star icon
- **Zones tab**: CRUD with edit modal, configure base charge, per-km charge, free delivery threshold, estimated time

### Inventory (`/dashboard/inventory`) - ENHANCED
- **Batches tab**: Add batches with full details (medicine ID, batch number, quantity, dates, price, barcode)
- **Suppliers tab**: CRUD with edit capability, contact details, address
- **Purchase Orders tab** (NEW): View purchase orders with status tracking
- **Expiry Alerts tab**: Days countdown for expiring batches, color-coded (expired = bold red, expiring soon = red)

### Notifications (`/dashboard/notifications`)
- **Send to User tab**: target specific user by ID
- **Broadcast tab**: send to all users
- Notification types: info, order update, promotion, reminder

### Analytics (`/dashboard/analytics`) - REWRITTEN
- **Revenue Overview tab**: 3 stat cards, revenue over time line chart, top selling medicines bar chart, payment method breakdown pie chart
- **Sales Reports tab**: daily reports table with orders, revenue, items sold, new users, avg order value
- **Drug Interactions tab** (NEW): manage drug interactions with severity levels (mild/moderate/severe/contraindicated), add new interactions with detailed form
- **Generate Report button**: creates today's sales report on demand
- **Configurable time period**: 7/30/90/365 days selector

---

## API Integration

### All Backend Endpoints Used

| Module | Endpoints |
|--------|-----------|
| **Auth** | `POST /api/auth/login`, `GET /api/users/me`, `POST /api/auth/refresh` |
| **Dashboard** | `GET /api/admin/dashboard` |
| **Categories** | `GET /api/categories/`, `GET/POST /api/admin/categories`, `PUT/DELETE /api/admin/categories/{id}` |
| **Medicines** | `GET/POST /api/admin/medicines`, `PUT/DELETE /api/admin/medicines/{id}`, `PUT /api/admin/medicines/{id}/stock`, `GET /api/admin/medicines/low-stock` |
| **Orders** | `GET /api/admin/orders`, `GET /api/admin/orders/{id}`, `PUT /api/admin/orders/{id}/status` |
| **Users** | `GET /api/admin/users`, `PUT /api/admin/users/{id}` |
| **Prescriptions** | `GET /api/admin/prescriptions`, `PUT /api/admin/prescriptions/{id}/review` |
| **Chat** | `GET /api/admin/chat/rooms`, `GET /api/chat/room/{id}/messages`, `POST /api/chat/room/{id}/message`, `POST /api/chat/room/{id}/upload`, `PUT /api/chat/room/{id}/read` |
| **Payments** | `GET /api/admin/payments/`, `POST /api/admin/payments/refund` |
| **Coupons** | `GET/POST /api/admin/coupons/`, `PUT/DELETE /api/admin/coupons/{id}` |
| **Delivery** | `GET/POST /api/admin/delivery/agents/`, `PUT /api/admin/delivery/agents/{id}`, `GET/POST /api/admin/delivery/zones/`, `PUT /api/admin/delivery/zones/{id}`, `POST /api/admin/delivery/assign`, `POST /api/admin/delivery/complete/{id}` |
| **Inventory** | `GET/POST /api/admin/inventory/batches/`, `PUT /api/admin/inventory/batches/{id}`, `GET /api/admin/inventory/expiring`, `GET/POST /api/admin/inventory/suppliers/`, `PUT /api/admin/inventory/suppliers/{id}`, `GET/POST /api/admin/inventory/purchase-orders/`, `PUT /api/admin/inventory/purchase-orders/{id}` |
| **Analytics** | `GET /api/admin/analytics/revenue`, `GET /api/admin/analytics/sales-reports`, `POST /api/admin/analytics/generate-report`, `GET/POST /api/admin/analytics/interactions`, `POST /api/admin/analytics/substitutes`, `PUT /api/admin/analytics/substitutes/{id}/verify` |
| **Notifications** | `POST /api/admin/notifications` |

### Error Handling

- Axios interceptors catch 401 responses and auto-refresh tokens
- All service calls return typed responses
- Pages use try/catch with toast notifications for user feedback
- `Promise.allSettled` used for parallel optional endpoint calls (graceful degradation)

---

## Real-time Features

### Socket.IO (Chat)

| Event | Direction | Purpose |
|-------|-----------|---------|
| `authenticate` | Emit | Send JWT token after connect |
| `join_room` | Emit | Join a chat room |
| `send_message` | Emit | Send text message |
| `typing` / `stop_typing` | Emit/Listen | Typing indicators |
| `new_message` | Listen | Receive new messages |

### WebRTC (Audio/Video Calls)

| Event | Direction | Purpose |
|-------|-----------|---------|
| `initiate_call` | Emit | Start audio/video call |
| `accept_call` | Emit | Accept incoming call |
| `reject_call` | Emit | Reject incoming call |
| `end_call` | Emit | End active call |
| `ice_candidate` | Both | Exchange ICE candidates |
| `call_incoming` | Listen | Incoming call notification |
| `call_accepted` | Listen | Call was accepted |
| `call_rejected` / `call_ended` | Listen | Call terminated |

---

## Authentication

### Flow

1. Admin enters email + password on `/login`
2. Backend returns `access_token` + `refresh_token`
3. Tokens stored in Zustand (persisted to localStorage)
4. Profile fetched from `/api/users/me` - role must be "admin"
5. All subsequent API calls include `Authorization: Bearer <token>`
6. On 401 response, automatic token refresh using refresh token
7. On refresh failure, logout and redirect to `/login`

### Protected Routes

All `/dashboard/*` routes are wrapped with `DashboardLayout` which checks `isAuthenticated` from the Zustand store. Unauthenticated users are redirected to `/login`.

---

## Component Library

| Component | Props | Description |
|-----------|-------|-------------|
| `DataTable<T>` | `columns, data, loading, emptyMessage, onRowClick` | Generic table with loading skeleton and empty state |
| `StatsCard` | `title, value, icon, trend?, color` | Dashboard metric card with colored icon |
| `Modal` | `isOpen, onClose, title, children, size` | Dialog with escape key and overlay close |
| `Badge` | `status, className?` | Color-coded status badge (auto-colors for common statuses) |
| `Pagination` | `currentPage, totalPages, onPageChange` | Page navigation with ellipsis for large ranges |
| `LoadingSpinner` | `size?, className?` | Animated border spinner (sm/md/lg) |
| `CallModal` | `isOpen, onClose, incomingCall?, outgoingUserId?, outgoingCallType?` | Full-screen WebRTC call interface |

### CSS Utility Classes (globals.css)

| Class | Description |
|-------|-------------|
| `.btn-primary` | Green primary button |
| `.btn-secondary` | Gray secondary button |
| `.btn-danger` | Red danger button |
| `.card` | White card with shadow and border |
| `.input-field` | Styled input with focus ring |
| `.badge` | Inline status badge base |
