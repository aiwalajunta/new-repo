# Changelog

All notable changes to **Aditya Textile — Art of Ethnic** are documented here.

## [Unreleased]

### Added
- Phase 1 scaffold — full Next.js 15 App Router project structure
- Sun-inspired brand palette (berry wine #6B1D3A + saffron gold #C8963B + warm ivory #FDF8F0)
- 13 Zod schemas covering all Google Sheets data tabs
- Google Sheets adapter layer with retry, rate-limit handling, and in-memory cache
- NextAuth v5 with owner (email+password) and customer (phone+OTP) providers
- Zustand store with persisted language, cart, and PWA state
- TanStack Query with 1-minute stale time optimised for Sheets API limits
- English + Hindi i18n (i18next) with locale JSON files
- Customer pages: Home, Categories, Product Detail, Wishlist, Cart, Reservations, Profile
- Owner pages: Dashboard, Products (CRUD), Reservations (status update), Customers
- API routes: products, categories, wishlist (CRUD), reservations (CRUD + PATCH), cart
- PWA manifest + Serwist service worker with offline caching
- Mobile-first bottom nav with 44px touch targets
- Festive auto-curation engine (10 Indian festivals)
- GitHub Actions CI pipeline
- Vercel config targeting bom1 (Mumbai) region
- 23/23 unit tests passing
