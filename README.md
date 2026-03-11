# ASLapp Frontend — E-Commerce Platform

**Angular 21 | TypeScript 5.9 | Bootstrap 5 | Axios**  
**Version:** 1.0.0 | **Date:** February 27, 2026

---

## 📝 Project Description

**ASLapp** is a modern, production-ready e-commerce single-page application built with Angular 21. It integrates with a Spring Boot 3 REST API backend to deliver a complete online shopping experience — from user registration and product browsing to cart management, checkout, and order tracking. The UI is fully responsive (mobile, tablet, desktop) using Bootstrap 5.

---

## ✨ Key Features

| Module | Capabilities |
|--------|-------------|
| **Authentication** | Signup, email verification, login, JWT token refresh, multi-session logout, role-based access |
| **Products** | Grid listing, search, category filter, sort (price/name), pagination, stock indicator |
| **Cart** | Add/remove items, real-time totals, cart badge, empty state handling |
| **Checkout** | Address selection/creation, 4 payment methods, order confirmation |
| **Orders** | Order history (paginated), status tracking with color badges, detailed view |
| **Profile** | Edit info, avatar upload, address CRUD (30+ Algerian wilayas), account deletion |
| **Admin** | Admin panel with protected routes, order status management |

---

## 🚀 Quick Start

```bash
cd E:\ASLappfrontend
npm install
npm start
# → http://localhost:4200
```

**Prerequisites:** Node.js 18+, npm 10+, Backend running on `http://localhost:8081`

**Production Build:**
```bash
npm run build    # Output: dist/aslappfrontend/
```

---

## 🛒 User Flows

**Registration:** Sign Up → Email Verification → Login → Dashboard

**Shopping:** Home → Products (Search/Filter/Sort) → Add to Cart → Cart → Checkout → Order Confirmation

**Profile:** Profile → Edit Info → Upload Avatar → Manage Addresses → Logout

---

## 📦 Tech Stack

| Technology | Version | Role |
|-----------|---------|------|
| Angular | 21.2.0 | Frontend framework (Signals, standalone components) |
| TypeScript | 5.9.2 | Type-safe language |
| Bootstrap | 5.3.8 | Responsive CSS framework |
| Bootstrap Icons | CDN | Icon library |
| Axios | 1.13.5 | HTTP client with interceptors |
| RxJS | 7.8.0 | Reactive programming |
| Vitest | 4.0.8 | Unit test runner |

---

## 📊 Project Stats

| Metric | Count |
|--------|-------|
| Components | 13 |
| Services | 5 |
| Route Guards | 3 |
| Data Models | 4 (12+ interfaces) |
| Routes | 10 |
| CSS Files | 15 |
| Total Source Files | 60+ |

---

## 🔐 Security

- **Cookie-based JWT** — HttpOnly, Secure, SameSite=Lax
- **Automatic token refresh** on 401 responses
- **Token blacklisting** on logout
- **3 Route Guards** — AuthGuard, AdminGuard, SellerGuard
- **CORS** configured with `withCredentials: true`
- **Client-side validation** + type-safe TypeScript interfaces

---

## 🌐 Environment Config

| Env | API URL | File |
|-----|---------|------|
| Development | `http://localhost:8081/api` | `src/environments/environment.ts` |
| Production | `https://api.yourdomain.com/api` | `src/environments/environment.prod.ts` |

---

## 🐳 Docker Deployment

```bash
docker-compose up -d
# → Frontend: http://localhost:4200
```

**Files:** `Dockerfile` (multi-stage build, Node 22 → Nginx, ~25MB), `nginx.conf` (SPA routing, gzip), `.dockerignore`

Frontend runs independently. Connect to backend at `http://localhost:8081` (ensure backend is running separately).

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| API connection failed | Ensure backend runs on port 8081 |
| CORS errors | Verify backend CORS allows `localhost:4200` with credentials |
| Cookies not persisting | Check browser cookie settings & SameSite policy |
| Port in use | `ng serve --port 4300` |
| Build fails | Delete `.angular` and `node_modules`, reinstall |

---

## 📚 Documentation

| File | Content |
|------|---------|
| `README.md` | Project overview (this file) |
| `ARCHITECTURE.md` | Technical architecture, file structure, API reference |
| `SETUP_AND_GUIDE.md` | Setup, development workflow, testing, deployment |

---

*Built with Angular 21 — ASLapp E-Commerce Platform*
