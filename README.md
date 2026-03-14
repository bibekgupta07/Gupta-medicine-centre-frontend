# Gupta Medicine Centre - Admin Dashboard

Web-based admin dashboard built with **Next.js 14** (App Router), **TypeScript**, and **Tailwind CSS** for managing the Gupta Medicine Centre pharmacy.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | Utility-first CSS styling |
| Zustand | Lightweight state management |
| Axios | HTTP client with interceptors |
| Socket.IO Client | Real-time chat messaging |
| WebRTC | Peer-to-peer video/audio calling |
| Recharts | Dashboard charts and analytics |
| React Hook Form + Zod | Form handling and validation |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |

## Features

| Page | Description |
|---|---|
| **Dashboard** | Real-time stats, revenue charts, order distribution pie chart, recent orders |
| **Medicines** | CRUD management, search, category filter, stock tracking |
| **Orders** | View/filter orders, status workflow (pending→confirmed→processing→shipped→delivered) |
| **Users** | Search users, filter by role, activate/deactivate accounts |
| **Prescriptions** | Review uploaded prescriptions with OCR text, approve/reject |
| **Chat** | Real-time Socket.IO chat with customers, typing indicators, message history |
| **Video/Audio Calls** | WebRTC calling with customers directly from chat |
| **Payments** | View payment history, process refunds |
| **Coupons** | Create/edit/delete discount coupons |
| **Delivery** | Manage delivery agents and zones, assign deliveries |
| **Inventory** | Medicine batches, suppliers, expiry alerts |
| **Notifications** | Send targeted notifications or broadcast to all users |
| **Analytics** | Revenue trends, top-selling medicines, order statistics |

## Project Structure

```
web/
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── layout.tsx                   # Root layout (Inter font, Toaster)
│   │   ├── globals.css                  # Tailwind + custom component classes
│   │   ├── page.tsx                     # Root redirect to /dashboard
│   │   ├── login/
│   │   │   └── page.tsx                 # Admin login page
│   │   └── dashboard/
│   │       ├── layout.tsx               # Dashboard layout wrapper
│   │       ├── page.tsx                 # Main dashboard with charts
│   │       ├── medicines/page.tsx       # Medicine CRUD
│   │       ├── orders/page.tsx          # Order management
│   │       ├── users/page.tsx           # User management
│   │       ├── prescriptions/page.tsx   # Prescription review
│   │       ├── chat/page.tsx            # Real-time chat (Socket.IO)
│   │       ├── payments/page.tsx        # Payment history
│   │       ├── coupons/page.tsx         # Coupon CRUD
│   │       ├── delivery/page.tsx        # Delivery agents & zones
│   │       ├── inventory/page.tsx       # Batches, suppliers, expiry
│   │       ├── notifications/page.tsx   # Send notifications
│   │       └── analytics/page.tsx       # Revenue & sales analytics
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # Collapsible navigation sidebar
│   │   │   ├── Header.tsx               # Top bar with search & profile
│   │   │   └── DashboardLayout.tsx      # Auth guard + layout wrapper
│   │   ├── ui/
│   │   │   ├── DataTable.tsx            # Generic sortable table
│   │   │   ├── StatsCard.tsx            # Dashboard stat card
│   │   │   ├── Modal.tsx                # Reusable modal dialog
│   │   │   ├── Badge.tsx                # Status badge with colors
│   │   │   ├── Pagination.tsx           # Page navigation
│   │   │   └── LoadingSpinner.tsx       # Loading indicator
│   │   └── call/
│   │       └── CallModal.tsx            # WebRTC call UI (audio/video)
│   ├── services/                        # API service layer
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── medicine.service.ts
│   │   ├── order.service.ts
│   │   ├── user.service.ts
│   │   ├── prescription.service.ts
│   │   ├── chat.service.ts
│   │   ├── payment.service.ts
│   │   ├── coupon.service.ts
│   │   ├── delivery.service.ts
│   │   ├── inventory.service.ts
│   │   └── notification.service.ts
│   ├── store/
│   │   └── auth.ts                      # Zustand auth store (persist)
│   ├── lib/
│   │   ├── api.ts                       # Axios instance + JWT interceptors
│   │   ├── utils.ts                     # cn(), formatCurrency, formatDate, getStatusColor
│   │   ├── socket.ts                    # Socket.IO client manager
│   │   └── webrtc.ts                    # WebRTC call manager
│   └── types/
│       └── index.ts                     # All TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
└── .env.local
```

## API Integration

### Axios Client (`lib/api.ts`)
- Base URL from `NEXT_PUBLIC_API_URL` environment variable
- Automatic JWT token injection via request interceptor
- Auto token refresh on 401 responses
- Redirect to login on auth failure

### Auth Flow
1. Admin logs in at `/login` with email/password
2. Tokens stored in Zustand (persisted to localStorage)
3. Profile fetched; non-admin users are rejected
4. All subsequent API calls include `Authorization: Bearer <token>`

## Real-Time Features

### Socket.IO Chat
- Connects on chat page mount, disconnects on unmount
- Real-time message receiving via `new_message` event
- Message sending via `send_message` event (not REST)
- Typing indicators with auto-timeout
- Connection status indicator (green/red)

### WebRTC Calling
- Audio and video call buttons in chat header
- STUN servers: `stun.l.google.com:19302`
- Call flow: `initiate_call` → `call_incoming` → `accept_call`/`reject_call`
- ICE candidate exchange for NAT traversal
- Mute/unmute audio, enable/disable video controls
- Full-screen call modal with local/remote video streams

## How to Run

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
cd web
npm install
```

### Development
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

### Production Build
```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Component Library

| Component | Props | Description |
|---|---|---|
| `DataTable<T>` | columns, data, loading, onRowClick | Generic table with loading skeleton |
| `StatsCard` | title, value, icon, trend, color | Dashboard metric card |
| `Modal` | isOpen, onClose, title, size | Dialog with escape/overlay close |
| `Badge` | status | Color-coded status badge |
| `Pagination` | currentPage, totalPages, onPageChange | Page navigation |
| `LoadingSpinner` | size, className | Animated spinner |
| `CallModal` | isOpen, incomingCall, outgoingUserId | WebRTC call interface |

## Backend API

The dashboard connects to the FastAPI backend running at `http://localhost:8000`. Ensure the backend is running:

```bash
cd ../  # bibek/ directory
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs available at http://localhost:8000/docs
