# Implementation Plan — PeachWeb & PeachWorlds Platform

## Phase 1: Project Scaffolding & Dual-Database Prisma Layer
1. Initialize `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, and `prisma.config.ts` in `/home/azadmin/peachweb`.
2. Author dual Prisma schemas:
   - `prisma/schema.prisma` (SQLite `file:./dev.db` for local development and automated test suites).
   - `prisma/schema.postgres.prisma` (PostgreSQL `DATABASE_URL` for production deployments).
3. Run `npx prisma migrate dev --name init` to generate the initial SQLite migration and Prisma client, plus author `prisma/seed.ts` as an explicit no-op (enforcing zero dummy data or demo user accounts).
4. Implement `src/lib/prisma.ts` supporting both `@prisma/adapter-better-sqlite3` and `@prisma/adapter-pg`.

## Phase 2: Invite-Only Account Admission, NextAuth Database Sessions, RBAC & Audit Logging
1. Implement `src/lib/account-admission/`:
   - `errors.ts`: Typed `AdmissionError` (`PUBLIC_REGISTRATION_DISABLED`, `INVITATION_INVALID`, `INVITATION_EXPIRED`, `INVITATION_REVOKED`, `INVITATION_ALREADY_USED`, `FORBIDDEN_ADMIN_ONLY`, etc.).
   - `policy.ts`: Email canonicalization, password complexity policy (`>= 8` chars, letters + numbers), and invitation TTL validation (`1`–`30` days).
   - `passwords.ts`: Cryptographic `scrypt` password hashing and timing-safe verification.
   - `tokens.ts`: `32`-byte `base64url` random token generation and `SHA-256` hashing.
   - `audit.ts`: Structured `recordAuditLog()` helper writing immutable `AuditLog` entries.
   - `invitations.ts`: `createOrRotateInvitation`, `revokeInvitation`, `validateInvitationToken`, `listInvitations`.
   - `registration.ts`: Atomic `$transaction` `acceptInvitation` creating `User`, default personal `Workspace`, and `AuditLog`.
   - `bootstrap.ts` & `scripts/bootstrap-admin.ts`: CLI-only initial `ADMIN` provisioning (`npm run bootstrap:admin`).
2. Implement `src/lib/auth.ts` (`NextAuthOptions` with `PrismaAdapter`, `session: { strategy: "database" }`, Credentials provider, and session user enrichment with `role` and `status`).
3. Implement Auth & Admin API routes:
   - `/api/auth/[...nextauth]/route.ts`
   - `/api/register/route.ts` (`403 PUBLIC_REGISTRATION_DISABLED`)
   - `/api/invitations/[token]/route.ts` & `/api/invitations/accept/route.ts`
   - `/api/admin/invitations/route.ts`, `/api/admin/invitations/[id]/route.ts`, `/api/admin/users/[id]/route.ts`, `/api/admin/audit-logs/route.ts`.
4. Implement Auth & Admin UI pages:
   - `/login` (PeachWorlds split-screen login with email/password + invite code shortcut)
   - `/register` (Invite-only notice + token input redirect)
   - `/invite/[token]` (Single-use invitation acceptance form with rich status handling)
   - `/admin/invitations` & `/admin/audit-logs` (Admin governance console).

## Phase 3: Public Marketing Surface (`peachweb.io` Parity)
1. Build shared marketing navigation (`<MarketingNavbar />`) with interactive hover mega-menus (`Product`, `Uses`, `Resources`) and responsive mobile drawer, plus `<MarketingFooter />`.
2. Build interactive Three.js scroll-reactive 3D hero & background canvas (`<MarketingThreeScene />`).
3. Implement `/`, `/features`, `/pricing` (with Monthly/Yearly Save 25% toggle & FAQ accordion), `/ecommerce`, `/portfolio`, `/technology`, `/storytelling`, and `/gallery`.

## Phase 4: PeachWorlds Workspace & 5-Step AI Site Generator (`/remix`)
1. Implement Workspace domain library (`src/lib/templates-catalog.ts` and `src/lib/remix-generator.ts`) providing curated 3D scene/UI blueprints (`SaaS`, `AI Tools`, `Agency`, `Portfolio`, `E-Commerce`, `Finance`, `Storytelling`) and deterministic AI site synthesis.
2. Implement Workspace API routes (`/api/workspaces`, `/api/websites`, `/api/websites/[id]`, `/api/websites/[id]/versions`, `/api/websites/[id]/publish`, `/api/websites/[id]/comments`, `/api/profile`).
3. Implement Workspace UI pages sharing the authentic dark PeachWorlds sidebar shell:
   - `/workspace` (`Get Started!` modal, `Start with AI`, featured templates, recent websites, workspace switcher, `Create a team` modal).
   - `/templates` & `/templates/[id]` (Search, category pills, live 3D preview, `Use Template`).
   - `/my-websites`, `/invites`, `/archive`, `/settings/profile`, `/settings/my-templates`.
   - `/remix` (5-step AI Site Generator Wizard with animated WebGL shader/orb background, live 3D Desktop/Tablet/Mobile preview in Steps 4–5, live brand color pickers, `Generate`, and `Continue in Builder`).

## Phase 5: 3D WebGL + UI Builder Studio (`/builder/[id]`, `/preview/[id]`, `/site/[slug]`)
1. Build the shared `<PeachThreeCanvas />` & `<PeachUiOverlay />` runtime renderer supporting:
   - Real Three.js `WebGLRenderer` (with programmatic procedural canvas fallback when headless GPU contexts lack WebGL shader compilation), PBR materials (`MeshStandardMaterial` / `MeshPhysicalMaterial`), dynamic lighting (`AmbientLight`, `DirectionalLight`, `PointLight`, `SpotLight`), raycasting object selection, transform gizmo controls, post-processing (`Bloom`, `Noise`, `Vignette`), and scroll-interpolated `keyframes`.
2. Build `/builder/[id]` studio with:
   - Top bar (`File`, `Edit`, `UI | 3D | Animate` mode switcher, `Desktop | Tablet | Mobile` viewport switcher, `Version History` modal, `Comments` pin overlay, `Share` modal, `Preview`, `Publish` modal).
   - Left Rail drawers (`Add Elements`, `Styles`, `Pages` & Layer Tree, `Assets`, `Site Settings`).
   - Right Contextual Inspector (UI Flexbox/Box-Model/Typography/States/Scroll Inspector in `UI` mode; 3D Environment/Camera/Post-Processing/Mesh Transform & Material Inspector in `3D` mode; Timeline Scrubber & Keyframe Editor in `Animate` mode).
3. Build `/preview/[id]` and `/site/[slug]` (live published 3D website player with scroll-driven 3D camera/object keyframe interpolation).

## Phase 6: Automated Verification, Tests & Production Build
1. Write unit & integration tests covering invite-only admission, token hashing, expiration, revocation, single-use replay prevention, RBAC, and audit logging.
2. Run `npm run lint`, `npm test`, and `npm run build`.
3. Start the production server and run end-to-end Playwright verification across marketing, bootstrap admin, invite creation/acceptance, `/remix` 5-step wizard, `/builder/[id]` (`UI`, `3D`, `Animate` modes, version snapshot, live publish), and `/site/[slug]`.
