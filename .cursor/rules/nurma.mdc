---
description: 
globs: 
alwaysApply: true
---
# 🧠 Coding Rules for Next.js + Tailwind + TypeScript + MongoDB Project

## ✅ GENERAL PRINCIPLES

- **Follow best practices. Always.**  
  Do not use shortcuts or workarounds to suppress errors or warnings.
- **Do not overengineer.**  
  Use the simplest and most understandable solution for the problem.
- **You have full authority.**  
  You may refactor or rewrite components, APIs, database models, or architecture if needed.
- **Never ignore errors or warnings.**  
  Fix the root cause. Never use `// @ts-ignore`, suppress ESLint errors, or add `eslint-disable` comments unless explicitly required with a clear justification.
- **Code must be production-grade.**  
  Everything should be reliable, performant, and easy to maintain.

---

## 📁 PROJECT STRUCTURE

- Use `/app` directory structure with Next.js App Router (`app/` over `pages/`).
- Keep code modular: use folders like `components/`, `lib/`, `models/`, `api/`, `hooks/`, `utils/`.
- Avoid deeply nested folder structures. Max depth should typically be 3.

---

## 🧑‍💻 CODE STYLE & TYPESCRIPT

- Always use strict TypeScript. No `any` unless unavoidable and documented.
- Use `zod` or similar libraries for runtime validation (especially for API inputs).
- Use named exports. Avoid default exports unless necessary.
- Prefer functional components and React hooks over class components.
- Use explicit return types for all exported functions/components.

---

## 🎨 TAILWIND & UI DESIGN

- Use **Tailwind CSS** utility classes only. Avoid custom CSS unless absolutely needed.
- Keep components small, reusable, and stateless when possible.
- Ensure accessibility (`aria-*`, semantic tags).
- Keep styling clean and consistent. Do not inline styles when a Tailwind class exists.

---

## 🌐 API ROUTES / SERVER LOGIC

- All server-side logic must be in `/app/api/` using route handlers or in `lib/` if shared.
- Validate all inputs from user/API before processing.
- Sanitize and validate MongoDB inputs — never trust raw data.
- Avoid duplicating logic between client/server. Use shared modules.

---

## 📦 MONGODB INTEGRATION

- Use `mongoose` or the official MongoDB driver with clear models.
- Never expose internal DB schema fields like passwords, internal IDs, or system fields to clients.
- Keep models lean and with business-logic-free schemas.
- Use indexes where appropriate, and avoid unnecessary collections.

---

## 🔍 ERROR HANDLING

- Fail fast and loudly. Do not silently catch errors.
- Use clear and helpful error messages for debugging and logging.
- Use centralized error boundaries (client) and structured error responses (server).

---

## ⚙️ BUILD CONFIGS & LINTING

- Use ESLint + Prettier. Do not disable rules unless justified with a comment.
- TypeScript strict mode must be on.
- Ensure all scripts and configs (`tsconfig`, `.eslintrc`, `next.config.js`) are clean and minimal.

---

## 🚫 WHAT NOT TO DO

- ❌ Never use `any`, `@ts-ignore`, or suppress ESLint rules without documentation.
- ❌ Never write workaround logic to hide real bugs.
- ❌ Never leave TODOs unresolved in production.
- ❌ Never write code you don’t understand or document.
- ❌ Never keep unused code, files, or packages in the repo.
- ❌ Never create the new file if you want to update some moments. Edit the older one and tell what was changed

---

## 🔁 REFACTORING & CHANGES

- You **may** and **should** make architectural changes if needed to:
  - Improve maintainability
  - Remove technical debt
  - Align with best practices
- All refactoring must leave the codebase cleaner, simpler, and more consistent.

---

## 📚 DOCUMENTATION & NAMING

- Do not write never commends
- Use clear, consistent, and descriptive names for variables, functions, components.

---

## 🚀 FINAL NOTE

**You are not here to patch code — you are here to write it correctly.**  
Fix problems at their source. Keep the system clean. Build for the long term.