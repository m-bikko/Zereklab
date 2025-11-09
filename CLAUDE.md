# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
npm run format:check
npm run format:fix

# Database scripts
npm run seed           # Seed initial data
npm run seed-quotes    # Seed daily quotes
npm run normalize-ages # Normalize age format
npm run migrate-age-format # Migrate age data
```

## Architecture Overview

This is a Next.js 14 e-commerce application for ZerekLab with the following key characteristics:

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Authentication**: Custom localStorage-based system
- **Internationalization**: Custom i18n with Russian (default), Kazakh, and English
- **Image Storage**: Cloudinary integration
- **State Management**: Zustand for cart, React hooks for auth
- **UI Components**: Framer Motion, Lucide React icons

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `[locale]/` - Localized pages (ru/kk/en)
  - `api/` - API endpoints for products, categories, auth, bonuses, sales
- `components/` - React components including admin management panels
- `lib/` - Utility functions (MongoDB, i18n, Cloudinary, WhatsApp)
- `models/` - Mongoose models (Product, Category, Sale, Bonus, etc.)
- `hooks/` - Custom hooks (useAuth, useSalesAuth, useLocale)
- `store/` - Zustand stores (cart management)
- `messages/` - Translation files for i18n

### Key Features
- Multi-language support (Russian/Kazakh/English)
- Admin panel for product/category management
- Sales system with separate authentication
- QR code analytics
- Shopping cart with WhatsApp integration
- Bonus/loyalty system
- Age-based product filtering
- Daily image rotation and quotes

### Authentication System

Two separate auth systems:
1. **Admin Auth** (`useAuth.ts`) - localStorage-based, 4-hour sessions
2. **Sales Auth** (`useSalesAuth.ts`) - for sales staff management

Admin credentials are configured via environment variables:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Environment Configuration

Required environment variables (see `AUTH_SETUP.md` and `DEPLOYMENT.md`):
- `MONGODB_URI` - MongoDB connection string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Admin credentials
- `NEXT_PUBLIC_WHATSAPP_NUMBER` - WhatsApp integration
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`

### Database Models

Core entities:
- `Product` - products with age ranges, multilingual names/descriptions
- `Category` - product categories with localized names
- `Sale` - sales transactions with staff tracking
- `SalesStaff` - sales team management
- `Bonus` - customer bonus/loyalty system
- `QRAnalytics` - QR code tracking
- `Quote` - daily motivational quotes

### Internationalization

Custom i18n system (`lib/i18n.ts`) with:
- Route-based locale detection via middleware
- Translation function `t(key, locale, params)`
- Localized content in database models
- Default locale: Russian (`ru`)

### Image Handling

Cloudinary integration for:
- Product images
- Daily rotation images
- Admin file uploads

Next.js Image component configured for multiple domains including Cloudinary and YouTube.