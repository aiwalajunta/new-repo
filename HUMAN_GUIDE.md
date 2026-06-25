# 🪻 Aditya Textile — Human Setup Guide

> **For Aditya:** Everything you need to get this app live. No developer background assumed. Follow each section in order.

---

## 📋 What You're Setting Up

1. **Google Sheets** — your database (products, customers, reservations, etc.)
2. **Vercel** — hosts the website/app for free
3. **GitHub** — stores your code and auto-deploys on every change

---

## Step 1 — Google Sheets (your database)

Create a spreadsheet named `Aditya Textile DB` with 13 tabs:
`Users`, `Categories`, `Products`, `ProductImages`, `ProductVariants`, `Wishlists`, `Carts`, `Reservations`, `Reviews`, `Notifications`, `LoyaltyLedger`, `FamilySizes`, `AuditLog`

**Users tab headers:** `id | role | email | phone | passwordHash | name | createdAt | lastLoginAt | isActive`

**Products tab headers:** `id | title | slug | categoryId | description | fabric | occasion | basePrice | discountPct | finalPrice | tags | isNewArrival | isTrending | isActive | createdAt | updatedAt`

**Reservations tab headers:** `id | customerId | productVariantId | visitDate | visitTime | status | notes | createdAt | expiresAt`

Add yourself as owner in Users tab: `usr_owner001 | owner | your@email.com | +91XXXXXXXXXX | [bcrypt-hash] | Your Name | 2024-01-01T00:00:00Z | 2024-01-01T00:00:00Z | true`

Generate password hash at: https://bcrypt-generator.com

---

## Step 2 — Vercel Deploy

1. Go to vercel.com → Sign up with GitHub
2. Import this repository
3. Add environment variables from `.env.example`
4. Click Deploy → app is live in ~2 minutes!

---

## Step 3 — Cloudinary (product photos)

1. Free account at cloudinary.com
2. Dashboard → copy Cloud Name
3. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in Vercel

---

## Common Issues

- **"Invalid JWT"** → `GOOGLE_PRIVATE_KEY` needs literal `\n` not real newlines in Vercel
- **Products not loading** → Check Products tab has headers in Row 1
- **Login not working** → `NEXTAUTH_URL` must match your exact Vercel URL

---

*Built with ❤️ for Aditya Textile — Art of Ethnic*
