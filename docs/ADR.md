# Architecture Decision Records (ADRs) — PeachWeb & PeachWorlds 3D Website Builder

## ADR-001: Unified Monorepo Next.js App Router Architecture Hosting Marketing (`peachweb.io`), Builder Workspace (`builder.peachworlds.com`), 3D Studio (`/builder/[id]`), and Published 3D Sites (`/site/[slug]`)

- **Status:** Accepted
- **Date:** 2026-04-17
- **Context:**
  Our reverse-engineering of `https://peachweb.io/` and `https://builder.peachworlds.com/` revealed four tightly coupled surface areas:
  1. **Marketing & Showcase Surface (`peachweb.io`):** Interactive scroll-driven 3D homepage, mega-menu navigation (`Product`, `Uses`, `Resources`), and 7 dedicated routes (`/features`, `/pricing`, `/ecommerce`, `/portfolio`, `/technology`, `/storytelling`, `/gallery`).
  2. **Workspace & Account Management Surface (`builder.peachworlds.com`):** Invite-only authentication, onboarding, workspace dashboard (`/workspace`), template gallery (`/templates`, `/templates/[id]`), `/my-websites`, `/invites`, `/archive`, `/settings/profile`, `/settings/my-templates`, and the 5-step AI Site Generator Wizard (`/remix`).
  3. **3D WebGL + UI Builder Studio (`/builder/[id]`):** A 3-mode creative studio (`UI`, `3D`, `Animate`) with Left Rail drawers (`Add Elements`, `Styles`, `Pages`, `Assets`, `Site Settings`), Right Inspectors (Flexbox/Box-Model/Typography/States/Scrolling in `UI` mode; Scene/Mesh/Light/Material/Post-Processing Shader Effects in `3D` mode; Keyframe Timeline Scrubber in `Animate` mode), and Top Bar workflows (`File`, `Edit`, `Viewport` switcher, `Version history`, `Comments`, `Share`, `Publish`, `Preview`).
  4. **Published Live 3D Site Player (`/site/[slug]`):** The live runtime engine equivalent to `*.peachweb.site` (e.g., `https://true-vassxk8vrp.peachweb.site`), rendering the published `uiStateJson` DOM overlay synchronized with the published `sceneStateJson` Three.js WebGL canvas and scroll/time keyframe tracks.
- **Decision:**
  Build a unified Next.js 16 App Router application in `/home/azadmin/peachweb` serving all four surfaces with shared TypeScript domain models, Prisma ORM persistence, and Three.js rendering pipelines. To preserve compatibility with original `builder.peachworlds.com` routes while serving the `peachweb.io` marketing experience at `/`, we expose:
  - Marketing pages at `/`, `/features`, `/pricing`, `/ecommerce`, `/portfolio`, `/technology`, `/storytelling`, `/gallery`.
  - Builder Workspace routes at `/workspace` (also aliased via top-level navigation tabs `/templates`, `/templates/[id]`, `/my-websites`, `/invites`, `/archive`, `/settings/profile`, `/settings/my-templates`, `/remix`).
  - 3D Studio at `/builder/[id]` and `/preview/[id]`.
  - Live published sites at `/site/[slug]`.
  - Admin Governance Console at `/admin/invitations` and `/admin/audit-logs`.
- **Consequences:**
  - Single deployment unit, zero cross-repo drift between the 3D Studio serializer and the Published 3D Site runtime player.
  - Shared authentication session (`next-auth.session-token`) across workspace, studio, and admin routes.

---

## ADR-002: Dual-Database Prisma 7 Adapter Strategy (SQLite for Local Dev/Test, PostgreSQL for Production)

- **Status:** Accepted
- **Date:** 2026-04-17
- **Context:**
  The system must run out-of-the-box in local development and CI using SQLite (`file:./dev.db`) while supporting PostgreSQL in production deployments without code changes in business logic or API handlers.
- **Decision:**
  Adopt the proven Prisma 7 dual-adapter architecture from `../Arcade`:
  - `prisma/schema.prisma` targets `sqlite` (`provider = "sqlite"`) with migrations in `prisma/migrations/`.
  - `prisma/schema.postgres.prisma` targets `postgresql` (`provider = "postgresql"`).
  - `prisma.config.ts` selects the schema file via `PRISMA_SCHEMA_FILE` (defaulting to `prisma/schema.prisma`) and reads `DATABASE_URL` (defaulting to `file:./dev.db`).
  - `src/lib/prisma.ts` inspects the `DATABASE_URL` protocol at runtime: `file:` instantiates `PrismaBetterSqlite3` (`@prisma/adapter-better-sqlite3`), whereas `postgres://` or `postgresql://` instantiates `PrismaPg` (`@prisma/adapter-pg`).
- **Consequences:**
  - Zero external database container required for local development, unit tests, or Playwright E2E tests.
  - Full production readiness for managed PostgreSQL via a single `DATABASE_URL` environment variable switch.

---

## ADR-003: Invite-Only Account Admission, Database Sessions, RBAC, Revocation, and Immutable Audit Logging

- **Status:** Accepted
- **Date:** 2026-04-17
- **Context:**
  Public self-registration must be disabled (`PUBLIC_REGISTRATION_DISABLED`). New users may only register via a valid, single-use, non-expired, non-revoked invitation token issued by an `ADMIN` or `OWNER`, or via the local CLI bootstrap script (`npm run bootstrap:admin`) when the database has zero users. Furthermore, every security-sensitive lifecycle event (bootstrap admin creation, invitation creation/rotation/revocation/acceptance, role changes, session revocation, website publishing) must be recorded in an immutable audit log.
- **Decision:**
  1. **Database-Backed Sessions Only:** Configure NextAuth (`Auth.js v4` with `@auth/prisma-adapter`) with `session: { strategy: "database" }`. Every session lookup queries the `Session` and `User` tables, ensuring that user suspension (`status !== "ACTIVE"`) or session revocation takes effect immediately on the next request.
  2. **Hashed Single-Use Invitations (`Invitation`):**
     - Raw tokens (`32` random bytes, `base64url`) are never persisted in plaintext; only `tokenHash = SHA-256(rawToken)` is stored (`@unique`).
     - Enforced single active invite per normalized email via `activeForEmail` (`@unique`, cleared to `null` upon acceptance, revocation, or superseding rotation).
     - Enforced expiration (`expiresAt`, default 7 days, configurable 1–30 days) and explicit status transitions (`PENDING` -> `ACCEPTED` | `REVOKED` | `EXPIRED`).
     - Atomic single-use acceptance inside `prisma.$transaction`: conditional `updateMany` on `Invitation` where `status = 'PENDING'` and `expiresAt > now` prevents concurrent replay races (`409 INVITATION_ALREADY_USED`).
  3. **Role-Based Access Control (RBAC):**
     - System roles (`UserRole`): `USER`, `ADMIN`.
     - Workspace/Team roles (`WorkspaceMemberRole`): `OWNER`, `ADMIN`, `EDITOR`, `VIEWER`.
  4. **Immutable Audit Trail (`AuditLog`):**
     - Persist structured audit events (`actorId`, `actorEmail`, `action`, `targetType`, `targetId`, `metadataJson`, `ipAddress`, `userAgent`, `createdAt`) for all admission, RBAC, invitation, and publishing mutations.
  5. **Zero Dummy Accounts / Zero Seed Data:**
     - `prisma/seed.ts` is an intentional no-op. No demo users or hardcoded credentials exist in application code or migrations.
- **Consequences:**
  - Complete defense-in-depth admission control matching `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md` extended with first-class `AuditLog` persistence and UI inspection.

---

## ADR-004: Dual-Layer Document Schema (`uiStateJson` + `sceneStateJson`) & Real Three.js WebGL Engine

- **Status:** Accepted
- **Date:** 2026-04-17
- **Context:**
  Reverse-engineering `peachweb.io/ui_state.json`, `peachweb.io/scene_state.json`, and the live GraphQL mutations on `builder.peachworlds.com` (`saveWebsiteChanges`, `createVersionHistory`, `publishWebsite`) revealed that every PeachWeb project consists of two synchronized JSON state trees:
  1. **`uiStateJson` (DOM & Responsive UI Layer):** Pages (`Home`, custom pages), hierarchical UI blocks (`Section`, `Container`, `Div`, `Text Block`, `Heading`, `Button`, `Link`, `Image`, `Video`, `Input`, `Checkbox`, `Form`), design tokens (color palette variables, typography styles), responsive breakpoint overrides (`Desktop 1280px`, `Tablet 768px`, `Mobile 390px`), interactive states (`Default`, `Hover`, `Pressed`), and scroll-section anchors.
  2. **`sceneStateJson` (Three.js 3D WebGL & Animation Layer):** Camera settings (`fov`, `position`, `target`, `exposure`), environment lighting (`AmbientLight`, `DirectionalLight`, `PointLight`, `SpotLight`, HDRI preset, background color/shader), 3D scene objects (`Box`, `Sphere`, `Cylinder`, `Torus`, `Cone`, `Plane`, `3D Text`, `GLB/Spline Asset` with `position`, `rotation`, `scale`, `material` PBR properties `color`, `metalness`, `roughness`, `emissive`, `wireframe`, `transmission`), post-processing effects (`Bloom`, `Noise`, `Vignette`, `ChromaticAberration`), and keyframe animation tracks (`scroll` 0.0–1.0 or `time` keyframes driving 3D object transforms and camera bookmarks).
- **Decision:**
  Implement a shared, strongly-typed `PeachDocumentState` (`uiState` + `sceneState`) rendered by a real `Three.js` WebGL canvas (`<PeachThreeCanvas />`) layered underneath an interactive DOM overlay (`<PeachUiOverlay />`), both inside `/builder/[id]` (with transform gizmos, raycast selection, and live inspector editing) and inside `/site/[slug]` / `/preview/[id]` (where window scroll progress `0..1` interpolates camera and mesh keyframes at 60fps).
- **Consequences:**
  - Every edit in `UI` mode, `3D` mode, or `Animate` mode immediately updates the live WebGL canvas and DOM overlay, saves to SQLite/PostgreSQL, snapshots into `WebsiteVersion`, and publishes to `/site/[slug]`.
