[← Back to README](README.md)
# ASLapp Frontend — Setup & Development Guide

---

## ✅ Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 10.0.0 | 10.8.2+ |
| Angular CLI | 21.0.0 | 21.x |
| OS | Windows 10+, macOS 10.14+, Linux | — |
| Backend | Spring Boot running on port 8081 | — |

---

## 🔧 Installation

```bash
# 1. Install Angular CLI
npm install -g @angular/cli@21

# 2. Install dependencies
cd E:\ASLappfrontend
npm install

# 3. Start dev server (HMR enabled, auto-reload)
npm start
# → http://localhost:4200
```

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @angular/core | ^21.2.0 | Framework |
| @angular/router | ^21.2.0 | Routing |
| bootstrap | ^5.3.8 | CSS framework |
| axios | ^1.13.5 | HTTP client |
| rxjs | ~7.8.0 | Reactive streams |
| typescript | ~5.9.2 | Language |
| vitest | ^4.0.8 | Unit tests |

---

## 🧰 Common Commands

```bash
npm start              # Dev server (localhost:4200)
npm run build          # Production build → dist/
npm test               # Unit tests (Vitest)
npm run watch          # Build in watch mode
ng generate component features/my-feature   # Scaffold component
npm audit fix          # Fix security issues
```

---

## 🌐 Environment Config

**Dev** — `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/api',
  apiHost: 'http://localhost:8081'
};
```

**Prod** — `src/environments/environment.prod.ts` → Update `apiBaseUrl` to your production domain.

---

## 🔍 Debugging (Browser DevTools — F12)

| Tab | Use |
|-----|-----|
| Console | Logs, errors, stack traces |
| Network (XHR) | Monitor API calls & responses |
| Application → Cookies | Verify `access_token` & `refresh_token` |
| Sources | Debug TypeScript with source maps |

---

## 🧪 Testing Checklist

- [ ] Signup → email verification → login
- [ ] Product search, category filter, sort, paginate
- [ ] Add to cart → view cart → remove item
- [ ] Checkout (address + payment) → order confirmation
- [ ] Order history → order detail view
- [ ] Profile edit, avatar upload, address CRUD
- [ ] Admin route blocked for non-admin users
- [ ] Logout clears session; 401 triggers token refresh

---

## 🚀 Production Build & Deployment

```bash
npm run build  # Output: dist/aslappfrontend/
```

Deploy `dist/aslappfrontend/` to any static server (Nginx, Apache, etc.). Ensure all routes redirect to `index.html`:

```nginx
location / { try_files $uri $uri/ /index.html; }
```

---

## 🐳 Docker (Production)

```bash
docker-compose up -d
```

**Runs frontend independently** (~25MB image). Multi-stage build: Node 22-alpine compiles Angular → Nginx 1.27-alpine serves it.

**Features:** SPA routing fallback, gzip compression, browser caching, security headers, health check.

**Backend:** Ensure your backend runs separately on port 8081. Frontend connects via configured API URL.

---

## ⚡ Performance Tips

| Technique | Details |
|-----------|---------|
| Lazy loading | `loadComponent: () => import(...)` in routes |
| Image lazy load | `<img loading="lazy">` |
| OnPush | `changeDetection: ChangeDetectionStrategy.OnPush` |
| AOT + Tree shaking | Enabled by default in prod builds |
| Pagination | 10 items/page reduces payload |

---

## 🔒 Security

- Keep deps updated (`npm audit fix`), use HTTPS in production
- Validate inputs on client AND server, never commit secrets
- Enable CORS only for trusted origins

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port in use | `ng serve --port 4300` |
| Module not found | Delete `node_modules`, run `npm install` |
| Build fails | Delete `.angular` folder, rebuild |
| CORS errors | Check backend allows origin + credentials |
| Memory crash | `set NODE_OPTIONS=--max-old-space-size=4096` |

---

## 💻 IDE Setup (VS Code)

**Extensions:** Angular Language Service, Prettier, ESLint, Bootstrap IntelliSense

---

## 📚 Resources

[Angular Docs](https://angular.dev) · [Bootstrap 5](https://getbootstrap.com/docs) · [TypeScript](https://www.typescriptlang.org/docs) · [Axios](https://axios-http.com) · [RxJS](https://rxjs.dev)

---

*ASLapp Setup & Development Guide — v1.0.0*
