# Task Backlog — PeachWeb & PeachWorlds Platform

| ID | Epic | Task | Priority | Status |
|---|---|---|---|---|
| TB-01 | Discovery | Playwright exploration of `peachweb.io` desktop/tablet/mobile routes, mega-menus, and subpages (`/features`, `/pricing`, `/ecommerce`, `/portfolio`, `/technology`, `/storytelling`, `/gallery`) | P0 | Done |
| TB-02 | Discovery | Playwright exploration of `builder.peachworlds.com` auth, onboarding, workspace routes, `/remix` 5-step AI wizard, and `/builder/[id]` 3D Studio | P0 | Done |
| TB-03 | Discovery | End-to-end live scenario execution on `builder.peachworlds.com` (UI element insertion, 3D primitive creation, keyframe animation, version snapshot, and live publishing to `*.peachweb.site`) | P0 | Done |
| TB-04 | Architecture | Author ADR, PRD, Technical Spec, Architecture/Data Model, Implementation Plan, Task Backlog, Acceptance Criteria, and Feature-Parity documents | P0 | Done |
| TB-05 | Database | Configure Prisma 7 dual-adapter setup (`schema.prisma` SQLite + `schema.postgres.prisma` PostgreSQL), run migrations, and enforce zero dummy/seed accounts | P0 | Pending |
| TB-06 | Auth & Security | Implement `account-admission` engine (`scrypt`, `SHA-256` single-use tokens, TTL expiration, rotation, revocation, atomic `$transaction` acceptance, CLI `bootstrap:admin`, and `AuditLog`) | P0 | Pending |
| TB-07 | Auth & Security | Implement NextAuth database sessions, `/login`, `/register` (blocked gate), `/invite/[token]`, `/admin/invitations`, and `/admin/audit-logs` | P0 | Pending |
| TB-08 | Marketing | Implement `peachweb.io` homepage (`/`) with scroll-driven Three.js 3D background, sticky navbar mega-menus (`Product`, `Uses`, `Resources`), and all 7 subpages | P0 | Pending |
| TB-09 | Workspace | Implement PeachWorlds workspace shell & routes (`/workspace`, `/templates`, `/templates/[id]`, `/my-websites`, `/invites`, `/archive`, `/settings/profile`, `/settings/my-templates`) | P0 | Pending |
| TB-10 | AI Generator | Implement `/remix` 5-step AI 3D Site Generator Wizard with WebGL shader/orb background, category/name/description/style/template steps, live 3D responsive preview, and live brand palette customizer | P0 | Pending |
| TB-11 | 3D Studio | Implement `/builder/[id]` with `UI`, `3D`, and `Animate` modes, Left Rail drawers (`Add Elements`, `Styles`, `Pages`, `Assets`, `Site Settings`), Right Inspectors, and real-time Three.js viewport | P0 | Pending |
| TB-12 | Studio Workflows | Implement `Version History` snapshots/restore, spatial `Comments` pins, `Share` modal, `Preview` (`/preview/[id]`), and `Publish` to live `/site/[slug]` | P0 | Pending |
| TB-13 | Verification | Run unit/integration tests, `npm run build`, and Playwright E2E verification across all user and admin workflows | P0 | Pending |
