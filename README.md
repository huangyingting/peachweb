# PeachWeb & PeachWorlds 3D Builder Studio

Production-ready full-stack clone of **PeachWeb** (`peachweb.io`) and **PeachWorlds 3D Builder Studio** (`builder.peachworlds.com`), built with **Next.js 16 (App Router)**, **React 19**, **Three.js (WebGL 2.0)**, **Auth.js / NextAuth v4**, and **Prisma 7** (SQLite for local development, PostgreSQL for production).

## Key Capabilities

1. **Marketing & Public Showcase (`/`, `/features`, `/pricing`, `/ecommerce`, `/portfolio`, `/technology`, `/storytelling`, `/gallery`)**:
   - Interactive scroll-reactive Three.js 3D hero scene, mega-menu navigation (`Product`, `Uses`, `Resources`), interactive `Monthly` / `Yearly (Save 25%)` pricing calculator, and filterable 3D showcase gallery.
2. **Invite-Only Account Admission, RBAC & Security Audit Trail (`/login`, `/register`, `/invite/[token]`, `/admin/invitations`, `/admin/audit-logs`)**:
   - Zero public self-registration (`/api/auth/register` returns HTTP `403 REGISTRATION_DISABLED`).
   - CLI-only root admin bootstrap (`npm run bootstrap:admin`) with zero HTTP bootstrap attack surface and zero dummy/demo users (`prisma/seed.ts` is an intentional no-op).
   - Single-use, expiring SHA-256 hashed invitation links, role management (`USER` / `ADMIN`), immediate session revocation on account disable, and an immutable `AuditLog` ledger.
3. **PeachWorlds Workspace & 5-Step AI Site Generator (`/workspace`, `/templates`, `/my-websites`, `/invites`, `/archive`, `/settings/profile`, `/settings/my-templates`, `/remix`)**:
   - Multi-workspace team switcher, `Create a team` modal, `Get Started!` modal, and full 5-step `/remix` AI Site Generator Wizard with live responsive 3D preview and brand color customizer.
4. **3D WebGL + UI Builder Studio (`/builder/[id]`, `/preview/[id]`, `/site/[slug]`)**:
   - Three editing modes (`UI` | `3D` | `Animate`), responsive viewport switcher (`Desktop` | `Tablet` | `Mobile`), Three.js scene graph & PBR material/shader inspector, scroll keyframe timeline dock, named version history snapshots with 1-click restore, spatial comments, and instant live publishing to `/site/[slug]`.

## Engineering Documentation

All architecture and specification documents are located in [`docs/`](./docs):
- [`docs/ADR.md`](./docs/ADR.md) — Architecture Decision Records
- [`docs/PRD.md`](./docs/PRD.md) — Product Requirements Document
- [`docs/SPEC.md`](./docs/SPEC.md) — Functional & Technical Specification
- [`docs/ARCHITECTURE_AND_DATA_MODEL.md`](./docs/ARCHITECTURE_AND_DATA_MODEL.md) — Dual SQLite/PostgreSQL Data Model & System Architecture
- [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) — Phased Implementation Plan
- [`docs/TASK_BACKLOG.md`](./docs/TASK_BACKLOG.md) — Engineering Task Backlog
- [`docs/ACCEPTANCE_CRITERIA.md`](./docs/ACCEPTANCE_CRITERIA.md) — Testable Acceptance Criteria
- [`docs/FEATURE_PARITY.md`](./docs/FEATURE_PARITY.md) — Feature-Parity Matrix & Playwright Visual Evidence (`screenshots/01_*`–`67_*`)

## Quick Start

```bash
npm install
npm run db:generate
npm run db:migrate

# Provision initial administrator via CLI (no demo accounts are seeded)
printf '%s\n' 'StrongAdminPass2026!' | npm run bootstrap:admin -- --email admin@example.com --name "Platform Admin" --password-stdin

# Start development server
npm run dev
```
