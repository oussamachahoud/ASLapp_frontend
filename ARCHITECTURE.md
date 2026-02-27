# ASLapp Frontend — Architecture & Technical Reference

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Client)                   │
└──────────────────────────┬───────────────────────────┘
                           │ HTTP/HTTPS
┌──────────────────────────▼───────────────────────────┐
│              Angular 21 Application                   │
│                                                       │
│  ┌─────────┐   ┌───────────┐   ┌──────────────────┐ │
│  │ Routes  │──▶│ Guards    │──▶│ Components (13)   │ │
│  │ (10)    │   │ Auth/Admin│   │ Feature + Shared  │ │
│  └─────────┘   │ Seller    │   └────────┬──────────┘ │
│                └───────────┘            │            │
│                              ┌──────────▼──────────┐ │
│                              │ Services (5)        │ │
│                              │ Auth│Product│Cart   │ │
│                              │ Order│Admin          │ │
│                              └──────────┬──────────┘ │
│                              ┌──────────▼──────────┐ │
│                              │ HttpService (Axios)  │ │
│                              │ • Cookie auth        │ │
│                              │ • 401 interceptor    │ │
│                              │ • Token refresh      │ │
│                              └──────────┬──────────┘ │
└──────────────────────────────────────────┼───────────┘
                                           │ REST API
┌──────────────────────────────────────────▼───────────┐
│          ASLapp Backend (Spring Boot 3)               │
│          http://localhost:8081/api                     │
└──────────────────────────────────────────────────────┘
```

---

## 📂 Project File Structure

```
src/
├── app/
│   ├── app.ts                    # Root component
│   ├── app.routes.ts             # Route definitions
│   ├── app.config.ts             # App configuration
│   │
│   ├── core/                     # Singleton services & logic
│   │   ├── guards/
│   │   │   ├── auth.guard.ts     # Authenticated users
│   │   │   ├── admin.guard.ts    # Admin-only access
│   │   │   └── seller.guard.ts   # Seller + admin access
│   │   ├── models/
│   │   │   ├── auth.models.ts    # User, Address, Auth DTOs
│   │   │   ├── product.models.ts # Product, Category, Pagination
│   │   │   ├── cart.models.ts    # Cart, CartItem
│   │   │   └── order.models.ts   # Order, OrderItem, Enums
│   │   └── services/
│   │       ├── http.service.ts   # Axios client + interceptors
│   │       ├── auth.service.ts   # Auth & user management
│   │       ├── product.service.ts# Products & categories
│   │       ├── cart.service.ts   # Shopping cart operations
│   │       ├── order.service.ts  # Order management
│   │       └── admin.service.ts  # Admin operations
│   │
│   ├── features/                 # Feature modules
│   │   ├── auth/
│   │   │   ├── login/            # Login form component
│   │   │   └── signup/           # Registration component
│   │   ├── home/                 # Landing page + hero
│   │   ├── products/
│   │   │   └── product-list/     # Product grid + search + filter
│   │   ├── cart/                 # Cart table + totals
│   │   ├── orders/
│   │   │   ├── checkout/         # Address + payment + place order
│   │   │   ├── order-list/       # Paginated order history
│   │   │   └── order-detail/     # Single order view
│   │   ├── profile/              # User profile + addresses
│   │   └── admin/                # Admin dashboard
│   │
│   └── shared/                   # Reusable components
│       └── navbar/               # Top navigation bar
│
├── environments/
│   ├── environment.ts            # Dev config (localhost:8081)
│   └── environment.prod.ts       # Prod config
│
├── styles.css                    # Global Bootstrap styles
├── index.html                    # HTML entry point
└── main.ts                       # Angular bootstrap
```

---

## 🔄 Component Dependency Graph

```
AppComponent
├── NavbarComponent ─────────────── AuthService, CartService
│
├── HomeComponent (/)
├── LoginComponent (/login) ─────── AuthService
├── SignupComponent (/signup) ────── AuthService
├── ProductListComponent (/products) ── ProductService, CartService
├── CartComponent (/cart) ───────── CartService [AuthGuard]
├── CheckoutComponent (/checkout) ── OrderService, AuthService [AuthGuard]
├── OrderListComponent (/orders) ── OrderService [AuthGuard]
├── OrderDetailComponent (/orders/:id) ── OrderService [AuthGuard]
├── ProfileComponent (/profile) ── AuthService [AuthGuard]
└── AdminComponent (/admin) ────── AdminService [AuthGuard + AdminGuard]
```

---

## 🔀 Route Configuration

| Path | Component | Guards | Access |
|------|-----------|--------|--------|
| `/` | HomeComponent | — | Public |
| `/login` | LoginComponent | — | Public |
| `/signup` | SignupComponent | — | Public |
| `/products` | ProductListComponent | — | Public |
| `/cart` | CartComponent | AuthGuard | Authenticated |
| `/checkout` | CheckoutComponent | AuthGuard | Authenticated |
| `/orders` | OrderListComponent | AuthGuard | Authenticated |
| `/orders/:id` | OrderDetailComponent | AuthGuard | Authenticated |
| `/profile` | ProfileComponent | AuthGuard | Authenticated |
| `/admin` | AdminComponent | Auth + Admin | Admin only |
| `**` | Redirect → `/` | — | Fallback |

---

## 🔗 API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login (sets cookies) |
| GET | `/auth/verify?token=` | Email verification |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/logout` | Logout (blacklist token) |
| POST | `/auth/logoutall` | Logout all sessions |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user |
| PATCH | `/users/me` | Update profile |
| POST | `/users/{id}/update-image` | Upload avatar |
| POST | `/users/me/address` | Add address |
| DELETE | `/users/me/address/{id}` | Delete address |
| DELETE | `/users/me` | Delete account |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all (paginated) |
| GET | `/products/search?q=` | Search products |
| GET | `/products/category/{name}` | Filter by category |
| POST | `/products/add-produit` | Create product |
| PUT | `/products/{id}` | Update product |
| PATCH | `/products/{id}/stock` | Update stock |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/category/all` | List categories |
| POST | `/category` | Create category |
| PATCH | `/category/{id}` | Update category |
| DELETE | `/category/{id}` | Delete category |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get user cart |
| POST | `/cart/add?idProduct=&quantity=` | Add item |
| DELETE | `/cart/remove/{itemId}` | Remove item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/place` | Place order |
| GET | `/orders` | Get user orders |
| GET | `/orders/{id}` | Get order detail |
| PUT | `/orders/admin/{id}/status` | Update status (admin) |

---

## 🔐 Authentication Flow (Sequence)

```
User                Angular App              Backend API
 │                      │                        │
 │── Login Form ──────▶│                        │
 │                      │── POST /auth/login ──▶│
 │                      │◀── Set-Cookie ────────│
 │                      │   (access_token,       │
 │                      │    refresh_token)       │
 │◀── Dashboard ───────│                        │
 │                      │                        │
 │── API Request ──────▶│                        │
 │                      │── GET /api/* ─────────▶│
 │                      │   (Cookie attached)     │
 │                      │◀── 200 OK ────────────│
 │                      │                        │
 │                      │── GET /api/* ─────────▶│
 │                      │◀── 401 Unauthorized ──│
 │                      │── POST /auth/refresh ─▶│
 │                      │◀── New Cookie ────────│
 │                      │── Retry original ─────▶│
 │                      │◀── 200 OK ────────────│
```

---

## 📐 Responsive Breakpoints

| Breakpoint | Width | Layout | Grid Columns |
|-----------|-------|--------|-------------|
| Mobile | < 576px | Single column, hamburger menu | 1 |
| Tablet | 576–992px | Two-column product grid | 2 |
| Desktop | > 992px | Three-column grid + sidebar | 3 |

---

## 🧩 Design Patterns Used

- **Standalone Components** — No NgModules, Angular 21 pattern
- **Signals** — Reactive state management (Angular Signals API)
- **Service Layer** — Business logic isolated in injectable services
- **Guard Pattern** — Route-level access control (CanActivate)
- **Interceptor Pattern** — Axios response interceptor for 401 → token refresh
- **Model/DTO Pattern** — TypeScript interfaces for type safety
- **Feature-based Structure** — Components organized by domain feature
- **Smart/Presentational** — Components delegate logic to services

---

*ASLapp Architecture Reference — v1.0.0*
