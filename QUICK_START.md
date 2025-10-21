# Order Panel - Quick Start Guide

## 🚀 Features Implemented

### ✅ Authentication System
- Login with Payload CMS credentials
- Protected routes with middleware
- User info displayed in header
- Logout functionality
- Session persistence

### ✅ Order Management
- Search orders by name, email, phone, company
- Sort orders by date (newest/oldest)
- Drag & drop section ordering
- Real-time WebSocket updates
- Move orders through pipeline:
  - Pending → In Progress / Rejected
  - In Progress → Completed
  - Completed → Archived

### ✅ API Integration
- Accept Order
- Decline Order
- Mark Ready
- Notify Delay
- Archive Order
- Fallback mode when backend not ready

---

## 🔧 Setup

### 1. Environment Variables

Create `.env` in `order_panel/`:
```bash
CMS_URL=http://localhost:3000
ORDER_URL=http://localhost:8003
```

### 2. Start Backend Services

#### Payload CMS (Port 3000):
```bash
cd server
npm run dev
```

#### Order Service (Port 8003):
```bash
cd order_service
# Start your order service here
```

### 3. Start Order Panel

```bash
cd order_panel
npm install  # if not already done
npm run dev
```

### 4. Create Admin User

If you don't have one:
- Visit `http://localhost:3000/admin`
- Create first user with role "admin"

### 5. Login to Order Panel

- Visit `http://localhost:3001/login`
- Login with your Payload CMS credentials
- Start managing orders!

---

## 📂 Project Structure

```
order_panel/
├── app/
│   ├── pages/
│   │   ├── index.vue              # Home page
│   │   ├── login.vue              # Login page ✨ NEW
│   │   ├── orders.vue             # Orders management (protected)
│   │   └── about.vue              # About page
│   ├── components/
│   │   ├── Header.vue             # Header with auth ✨ UPDATED
│   │   ├── Footer.vue
│   │   └── OrdersPage/
│   │       ├── OrderTile/
│   │       └── DeclineOrderModal/
│   └── layouts/
│       └── default.vue
│
├── composables/
│   ├── useAuth.ts                 # Auth composable ✨ NEW
│   ├── useApi.ts
│   ├── useGetOrderList.ts
│   ├── useAcceptOrder.ts          # ✨ UPDATED
│   ├── useDeclineOrder.ts         # ✨ UPDATED
│   ├── useMarkReadyOrder.ts       # ✨ NEW
│   ├── useNotifyDelayOrder.ts     # ✨ NEW
│   └── useArchiveOrder.ts         # ✨ NEW
│
├── middleware/
│   └── auth.ts                    # Auth middleware ✨ NEW
│
├── types/
│   └── order.ts
│
├── API_ENDPOINTS.md               # ✨ NEW
├── AUTH_IMPLEMENTATION.md         # ✨ NEW
├── IMPLEMENTATION_SUMMARY.md      # ✨ NEW
└── QUICK_START.md                 # ✨ NEW (this file)
```

---

## 🔐 Authentication Flow

```
User visits /orders
       ↓
Not authenticated? → Redirect to /login
       ↓
Login form
       ↓
POST to Payload CMS /api/users/login
       ↓
Save token & user to localStorage
       ↓
Redirect to /orders
       ↓
Show orders + user info in header
```

---

## 🎯 Order Pipeline

```
┌──────────┐
│ PENDING  │ → Accept → ┌─────────────┐
└──────────┘            │ IN PROGRESS │
     ↓                  └─────────────┘
  Decline                      ↓
     ↓                    Mark Ready
┌──────────┐                   ↓
│ REJECTED │            ┌───────────┐
└──────────┘            │ COMPLETED │
                        └───────────┘
                               ↓
                          Archive
                               ↓
                          (Removed)
```

---

## 🔧 Backend Requirements

### Already Implemented:
- ✅ `GET /orders` - Get all orders
- ✅ `WS /ws/orders` - Real-time updates
- ✅ Payload CMS authentication

### To Implement:
- [ ] `POST /orders/:id/accept`
- [ ] `POST /orders/:id/decline`
- [ ] `POST /orders/:id/mark-ready`
- [ ] `POST /orders/:id/notify-delay`
- [ ] `POST /orders/:id/archive`

See `API_ENDPOINTS.md` for detailed specifications.

---

## 📝 Key Features

### Search & Filter
- Real-time search across all fields
- Searches: name, surname, email, phone, company, comments
- Shows result count
- Clear button to reset search

### Sort
- Sort by date: newest first or oldest first
- Applies to all sections
- Works with search filtering

### Section Management
- Drag & drop to reorder sections
- Order saved to localStorage
- Each section only shows when it has orders
- Color-coded by status

### Real-time Updates
- WebSocket connection for live order updates
- New orders appear instantly
- Order updates reflected immediately

---

## 🐛 Troubleshooting

### Cannot login
1. Check Payload CMS is running on port 3000
2. Verify `CMS_URL` in `.env`
3. Ensure user exists in Payload CMS
4. Check browser console for errors

### Orders not showing
1. Check Order Service is running on port 8003
2. Verify `ORDER_URL` in `.env`
3. Check WebSocket connection in console
4. Verify backend has orders in database

### CORS errors
Add to Payload CMS `.env`:
```bash
CORS_ORIGINS=http://localhost:3001,http://localhost:3000
```

### Logout button not working
1. Check Header component imported `useAuth`
2. Verify auth is initialized
3. Check browser console for errors

---

## 📚 Documentation

- **`API_ENDPOINTS.md`** - Complete API documentation with curl examples
- **`AUTH_IMPLEMENTATION.md`** - Detailed authentication documentation
- **`IMPLEMENTATION_SUMMARY.md`** - Overview of all implementations
- **`QUICK_START.md`** - This file

---

## ✅ Testing Checklist

### Authentication:
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Access `/orders` without login (should redirect to login)
- [ ] Logout (should clear session and redirect)
- [ ] Refresh page while logged in (should stay logged in)

### Orders:
- [ ] View all orders
- [ ] Search orders
- [ ] Sort orders by date
- [ ] Drag sections to reorder
- [ ] Accept pending order
- [ ] Decline pending order
- [ ] Mark in-progress order as ready
- [ ] Notify delay on in-progress order
- [ ] Archive completed order

### UI:
- [ ] Desktop view works
- [ ] Mobile view works
- [ ] Mobile menu shows user info
- [ ] User initials display correctly

---

## 🎉 You're All Set!

Your Order Panel now has:
- ✅ Full authentication system
- ✅ Order management with pipeline
- ✅ Search and sort functionality
- ✅ Real-time updates
- ✅ API integration with fallback mode
- ✅ Protected routes
- ✅ User-friendly UI

The frontend is complete and ready. Once you implement the 5 backend endpoints, everything will work end-to-end!
