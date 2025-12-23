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

This is a Next.js 14 e-commerce application for ZerekLab — an educational toys store targeting children in Kazakhstan.

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS + @tailwindcss/typography
- **Authentication**: Custom localStorage-based system
- **Internationalization**: Custom i18n with Russian (default), Kazakh, and English
- **Image Storage**: Cloudinary integration
- **State Management**: Zustand for cart, React hooks for auth
- **UI Components**: Framer Motion, Lucide React icons, React Quill (rich text editor)
- **API Documentation**: Swagger/OpenAPI 3.0

### Directory Structure

```
app/
├── [locale]/           # Localized pages (ru/kk/en)
│   ├── admin/          # Admin panel
│   ├── blog/           # Blog listing and posts
│   ├── products/       # Product catalog
│   ├── sales/          # Sales staff interface
│   └── ...
├── api/                # API routes
│   ├── auth/           # Authentication endpoints
│   ├── blog/           # Blog CRUD + featured/popular
│   ├── bonuses/        # Bonus system
│   ├── categories/     # Category management
│   ├── products/       # Product management
│   ├── sales/          # Sales transactions
│   ├── docs/           # Swagger documentation
│   └── ...
components/
├── admin/              # Admin management panels
│   ├── BlogManagement.tsx
│   ├── ProductManagement.tsx
│   ├── CategoryManagement.tsx
│   ├── BonusManagement.tsx
│   └── ...
├── blog/               # Blog design variants
│   ├── MagazineBlogList.tsx
│   ├── MagazineBlogPost.tsx
│   └── MagazineBlogSection.tsx
├── BlogSection.tsx     # Featured blog posts (with design switcher)
├── RichTextEditor.tsx  # React Quill wrapper
├── Navbar.tsx
├── CartModal.tsx
└── ...
lib/                    # Utilities
├── mongodb.ts          # Database connection
├── i18n.ts             # Internationalization
├── cloudinary.ts       # Image uploads
├── swagger.ts          # API documentation
├── blogDesign.ts       # Blog design switcher
└── ...
models/                 # Mongoose schemas
├── Product.ts
├── Category.ts
├── Blog.ts
├── Sale.ts
├── Bonus.ts
├── PendingBonus.ts
└── ...
hooks/                  # Custom React hooks
├── useAuth.ts          # Admin authentication
├── useSalesAuth.ts     # Sales staff auth
└── useLocale.ts
store/                  # Zustand stores
└── cartStore.ts
messages/               # i18n translations
├── ru.json
├── kk.json
└── en.json
```

### Key Features

- **Multi-language support** (Russian/Kazakh/English)
- **Admin panel** for product/category/blog management
- **Blog system** with rich text editor, media, sources, SEO, switchable design themes
- **Sales system** with separate authentication
- **Bonus/loyalty system** (3% cashback, 10-day pending period)
- **Shopping cart** with WhatsApp integration
- **QR code analytics**
- **Age-based product filtering**
- **Daily image rotation and quotes**
- **API documentation** via Swagger UI

### Database Models

| Model | Description |
|-------|-------------|
| `Product` | Products with multilingual content, age ranges, difficulty levels |
| `Category` | Categories with subcategories and filtering parameters |
| `Blog` | Blog posts with rich content, SEO, media, sources |
| `Sale` | Sales transactions with bonus calculation |
| `Bonus` | Customer bonus balances |
| `PendingBonus` | Delayed bonuses (available after 10 days) |
| `SalesStaff` | Sales team with hashed passwords |
| `Quote` | Daily motivational quotes |
| `QRAnalytics` | QR code scan tracking |
| `Contact` | Customer contact messages |

### Authentication System

Two separate auth systems:
1. **Admin Auth** (`useAuth.ts`) - localStorage-based, 4-hour sessions
2. **Sales Auth** (`useSalesAuth.ts`) - 8-hour sessions

Admin credentials via environment variables:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Environment Configuration

Required environment variables:
```
MONGODB_URI              # MongoDB connection string
ADMIN_USERNAME           # Admin login
ADMIN_PASSWORD           # Admin password
NEXT_PUBLIC_WHATSAPP_NUMBER  # WhatsApp for orders
CLOUDINARY_CLOUD_NAME    # Cloudinary config
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Optional:
```
NEXT_PUBLIC_BLOG_DESIGN  # Blog design theme: "default" or "magazine"
```

### API Routes

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/products` | GET, POST | List/create products |
| `/api/products/[id]` | GET, PUT, DELETE | Single product ops |
| `/api/categories` | GET, POST | List/create categories |
| `/api/blog` | GET, POST | List/create blog posts |
| `/api/blog/featured` | GET | Featured blog posts |
| `/api/blog/popular` | GET | Popular by views/likes |
| `/api/blog/[slug]` | GET, PUT, DELETE | Single post by slug |
| `/api/blog/[slug]/like` | POST | Increment likes |
| `/api/bonuses` | GET, POST | Bonus management |
| `/api/sales` | POST | Record sales |
| `/api/docs` | GET | Swagger UI |

### Internationalization

Custom i18n system (`lib/i18n.ts`):
- Route-based locale detection via middleware
- Translation function `t(key, locale, params)`
- Localized content in database models
- Default locale: Russian (`ru`)
- Translation files in `messages/` folder

---

## Coding Rules

### General Principles

- **Follow best practices. Always.** No shortcuts or workarounds to suppress errors.
- **Do not overengineer.** Use the simplest and most understandable solution.
- **You have full authority.** May refactor components, APIs, models, or architecture if needed.
- **Never ignore errors or warnings.** Fix the root cause.
- **Code must be production-grade.** Reliable, performant, maintainable.

### Code Style & TypeScript

- Always use strict TypeScript. No `any` unless unavoidable and documented.
- Use `zod` or similar for runtime validation (especially API inputs).
- Use named exports. Avoid default exports unless necessary.
- Prefer functional components and React hooks over class components.
- Use explicit return types for all exported functions/components.

### Tailwind & UI Design

- Use **Tailwind CSS** utility classes only. Avoid custom CSS unless absolutely needed.
- Keep components small, reusable, and stateless when possible.
- Ensure accessibility (`aria-*`, semantic tags).
- Keep styling clean and consistent.

### API Routes / Server Logic

- All server-side logic in `/app/api/` or shared in `lib/`.
- Validate all inputs before processing.
- Sanitize MongoDB inputs — never trust raw data.
- Avoid duplicating logic between client/server.

### MongoDB Integration

- Use `mongoose` with clear models.
- Never expose internal DB fields (passwords, internal IDs) to clients.
- Keep models lean and business-logic-free.
- Use indexes where appropriate.

### Error Handling

- Fail fast and loudly. Do not silently catch errors.
- Use clear and helpful error messages.
- Use centralized error boundaries (client) and structured error responses (server).

### Build Configs & Linting

- Use ESLint + Prettier. Do not disable rules unless justified.
- TypeScript strict mode must be on.
- Keep configs clean and minimal.

### What NOT To Do

- ❌ Never use `any`, `@ts-ignore`, or suppress ESLint rules without documentation
- ❌ Never write workaround logic to hide real bugs
- ❌ Never leave TODOs unresolved in production
- ❌ Never write code you don't understand
- ❌ Never keep unused code, files, or packages
- ❌ Never create new files when editing existing ones would suffice

### Refactoring & Changes

You **may** and **should** make architectural changes if needed to:
- Improve maintainability
- Remove technical debt
- Align with best practices

All refactoring must leave the codebase cleaner, simpler, and more consistent.

### Documentation & Naming

- Do not write unnecessary comments
- Use clear, consistent, and descriptive names for variables, functions, components

---

## Final Note

**You are not here to patch code — you are here to write it correctly.**
Fix problems at their source. Keep the system clean. Build for the long term.
