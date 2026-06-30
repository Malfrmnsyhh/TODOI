# Workspace Instruction Mandate: FocusFlow Todo App Reconstruction 🚀

This file establishes the foundational mandates, code conventions, and engineering workflows for the reconstruction of the **FocusFlow Todo App**. Any development agent or developer working on this workspace **MUST** strictly adhere to the instructions laid out here.

---

## 🏛️ Foundational Goals

1. **Database Integration:** Swap the transient in-memory arrays and generic `localStorage` fallbacks with a persistent, secure SQLite (local) / PostgreSQL (production) database layer using **Prisma ORM**.
2. **Simple Secure Authentication:** Implement a self-contained custom JWT-based authentication system using secure HTTP-Only Cookies to ensure multi-user isolation. No external paid auth platforms should be integrated.
3. **Dynamic Elements:** Convert the hardcoded calendar widget into a dynamic Javascript-driven calendar displaying the current month, and show task markers for days that have pending due tasks.
4. **Professional Data Visualization:** Replace the "Chart Coming Soon" placeholder with interactive and fully responsive charts powered by the **Recharts** library.
5. **Aesthetics & Performance:** Keep the futuristic dark/neon cybernetic interface (dark-blue `#0b1326`, glass panels, custom scrollbars, indigo/blue glows) intact.

---

## ⚙️ Technical Conventions & Style Guide

### 1. TypeScript & Strict Typing
- **No Casts / Bypasses:** Do NOT use `as any` or suppress TypeScript errors with `@ts-ignore`. Explicitly declare type structures, interfaces, and Zod validator schemas.
- All new API handlers must be fully typed with Next.js standard App Router types (e.g. `NextRequest`, `NextResponse`).

### 2. Database & State Integrity (Prisma + Zustand)
- Use `lib/prisma.ts` as the singular PrismaClient manager to avoid connection leaks during hot reload in local development.
- Synchronize frontend user state inside the Zustand store (`store/taskStore.ts`) to manage session loading, user details, and active dynamic tasks cleanly.

### 3. Authentication & Cookies
- Passwords must be hashed using `bcryptjs` with a salt round of 10.
- JWT tokens must be passed to the browser via HTTP-Only, SameSite (Strict), Secure (in production) cookies under the name `auth_token`. Do not store JWT tokens in localStorage to prevent XSS-based session hijacking.

### 4. Dynamic Calendar Engine
- Dates list must be computed dynamically using the Javascript `Date` API.
- Maintain support for moving between calendar months using active state.
- Query tasks on current date and project a dot or styling on date tiles if tasks are due.

### 5. Charts Engine
- Use **Recharts** for SVG-based charts.
- The charts should use Tailwind CSS colors (`#6366f1` for Indigo, `#3b82f6` for Blue) to perfectly align with the app's visual style.

---

## 📈 Roadmap Steps

1. **Database Setup:** 
   - Initialize Prisma ORM.
   - Deploy `prisma/schema.prisma` with `User` and `Task` relation.
   - Run migrations to generate `dev.db`.
2. **Auth API Implementation:**
   - Write `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
   - Setup cookie issuing logic.
3. **Tasks API Connection:**
   - Restructure `/api/tasks/route.ts` and `/api/tasks/[id]/route.ts` to fetch and write records bound to the authenticated `userId`.
4. **User Frontend Integration:**
   - Design `/login` and `/register` client-side pages.
   - Authenticate on mount via `/api/auth/me`.
5. **Interactive Calendar & Recharts:**
   - Rewrite `RightPanel.tsx` to handle calendar dates dynamically.
   - Deploy `components/ActivityChart.tsx` powered by Recharts.
6. **Tests and Validation:**
   - Ensure the Next.js compilation, type check, and lint commands pass flawlessly.
