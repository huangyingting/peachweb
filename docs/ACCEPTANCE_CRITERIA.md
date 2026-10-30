# Acceptance Criteria — PeachWeb & PeachWorlds Platform

## AC-1: Zero Dummy Data & Zero Demo Accounts
- [ ] Running `npx prisma migrate deploy` and `npx prisma db seed` results in `0` users, `0` workspaces, `0` websites, and `0` invitations in the database.
- [ ] No hardcoded demo accounts, backdoor credentials, or pre-populated user rows exist anywhere in the codebase.

## AC-2: CLI Root Admin Bootstrap & Invite-Only Registration
- [ ] Running `npm run bootstrap:admin -- --email <admin-email> --password-stdin` succeeds when `User.count() === 0`, creating an `ADMIN` user, their default `Workspace`, and an `ADMIN_BOOTSTRAP` entry in `AuditLog`.
- [ ] Running `bootstrap:admin` a second time when a user already exists fails with `409 BOOTSTRAP_ALREADY_COMPLETED`.
- [ ] Calling `POST /api/register` directly returns `403 { code: "PUBLIC_REGISTRATION_DISABLED" }`.
- [ ] Unauthenticated requests to `/workspace`, `/my-websites`, `/remix`, `/builder/[id]`, or `/admin/*` redirect to `/login`.

## AC-3: Single-Use, Expiring Invitations, Rotation, Revocation & RBAC
- [ ] Non-admin (`USER`) requests to `/admin/invitations`, `/admin/audit-logs`, or `/api/admin/*` return `403`.
- [ ] An `ADMIN` can create an invitation for an email with role `USER` or `ADMIN` and an expiration window (`1`–`30` days).
- [ ] Only the `SHA-256` hash (`tokenHash`) is stored in the `Invitation` table; the raw token is returned only once at creation/rotation.
- [ ] Visiting `/invite/[token]` with a valid `PENDING` token displays the invited email, assigned role, and registration form.
- [ ] Submitting `/invite/[token]` atomically creates the `User` (`ACTIVE`), marks the `Invitation` as `ACCEPTED` (`activeForEmail = null`), creates the user's default `Workspace`, and records `INVITATION_ACCEPTED` in `AuditLog`.
- [ ] Reusing the same invitation token a second time returns `409 INVITATION_ALREADY_USED` and renders the "Invitation Already Used" state.
- [ ] Revoking a `PENDING` invitation transitions it to `REVOKED`; subsequent attempts to redeem it return `410 INVITATION_REVOKED`.
- [ ] Expired invitations (`expiresAt <= now()`) return `410 INVITATION_EXPIRED`.
- [ ] Disabling a user (`status = "DISABLED"`) immediately deletes all their active `Session` rows and prevents subsequent login (`403 ACCOUNT_DISABLED`).

## AC-4: Marketing Website (`peachweb.io` Parity)
- [ ] `/` renders the interactive scroll-driven 3D WebGL scene, sticky navbar with `Product`, `Uses`, and `Resources` mega-menus, feature sections, showcase cards, pricing preview, FAQ accordion, and footer across Desktop (`1440px`), Tablet (`768px`), and Mobile (`390px`).
- [ ] `/features`, `/pricing` (including functional Monthly/Yearly Save 25% billing toggle), `/ecommerce`, `/portfolio`, `/technology`, `/storytelling`, and `/gallery` all render with zero console or runtime errors.

## AC-5: PeachWorlds Workspace & `/remix` 5-Step AI Site Generator
- [ ] Authenticated users can access `/workspace`, `/templates`, `/templates/[id]`, `/my-websites`, `/invites`, `/archive`, `/settings/profile`, and `/settings/my-templates`.
- [ ] Users can create a new team workspace via the `Create a team` modal and switch between workspaces.
- [ ] Users can complete all 5 steps of `/remix` (`Category` -> `Business Name` -> `Business Description` -> `Style Collection` -> `3D Design with Live Preview` -> `Brand Color Palette + Generate + Continue in Builder`), which persists a new `Website` and opens `/builder/[id]`.

## AC-6: 3D Builder Studio (`/builder/[id]`) & Live Published 3D Site (`/site/[slug]`)
- [ ] `/builder/[id]` supports switching between `UI`, `3D`, and `Animate` modes and `Desktop`, `Tablet`, and `Mobile` viewports.
- [ ] In `UI` mode, users can add UI elements (`Section`, `Heading`, `Text Block`, `Button`, `Card`, `Form`) and edit layout, spacing, typography, and colors in the Right Inspector.
- [ ] In `3D` mode, users can add 3D primitives (`Box`, `Sphere`, `Cylinder`, `Torus`, `Cone`, `Plane`, `Light`), select objects, and edit `Position`, `Rotation`, `Scale`, PBR `Material` (`Color`, `Metalness`, `Roughness`, `Wireframe`), and Post-Processing (`Bloom`, `Noise`, `Vignette`).
- [ ] In `Animate` mode, users can scrub the `0%–100%` scroll timeline and record/delete keyframes for camera and 3D object transforms.
- [ ] Users can save named `Version History` snapshots (e.g., `v1.0 Cylinder 3D Scene`), restore prior snapshots, pin spatial `Comments`, preview at `/preview/[id]`, and publish live to `/site/[slug]`.
- [ ] Visiting `/site/[slug]` renders the published 3D WebGL scene and UI overlay with live scroll-interpolated 3D animations.
