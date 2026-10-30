# Product Requirements Document (PRD) — PeachWeb & PeachWorlds 3D Website Builder

## 1. Executive Summary & Vision
**PeachWeb (`peachweb.io`)** and **PeachWorlds Builder (`builder.peachworlds.com`)** form an end-to-end 3D WebGL website creation, collaboration, and publishing platform. Creators, agencies, and product teams use PeachWeb to build interactive, scroll-driven 3D websites without writing WebGL/GLSL boilerplate.

Our production-ready application replicates the complete functional and visual experience discovered across `peachweb.io` and `builder.peachworlds.com`, while enforcing enterprise-grade **invite-only account admission**, **single-use/expiring invitation codes**, **role-based access control (RBAC)**, **immediate revocation**, and **immutable audit logging**, with **zero dummy user accounts** in production or seed scripts.

---

## 2. Target Personas
1. **3D Web Designer / Creative Technologist (`EDITOR` / `OWNER`):**
   - Uses the 3D Builder Studio (`/builder/[id]`) to compose responsive UI sections over a real-time Three.js 3D viewport, configure PBR materials and post-processing bloom/noise shaders, keyframe scroll-triggered 3D animations (`Animate` mode), create version snapshots, and publish live 3D sites (`/site/[slug]`).
2. **Founder / Marketer (`USER` / `OWNER`):**
   - Uses the 5-step AI Site Generator Wizard (`/remix`) or curated 3D Templates (`/templates`) to spin up a branded 3D website in under 60 seconds, customize the color palette and copy, and publish to a custom slug.
3. **Platform Administrator (`ADMIN`):**
   - Provisions initial access via the CLI bootstrap script (`npm run bootstrap:admin`), issues single-use/expiring invitation links at `/admin/invitations`, manages user roles and account status (`ACTIVE` / `DISABLED`), revokes active invitations or sessions, and inspects the security audit trail at `/admin/audit-logs`.

---

## 3. Core Product Surfaces & Functional Requirements

### 3.1 Public Marketing Website (`peachweb.io` Parity)
- **Interactive 3D Scroll-Driven Homepage (`/`):**
  - Fixed WebGL 3D background scene that transitions camera angles, lighting, and 3D hero geometry smoothly as the user scrolls through 10+ sections (`Hero: Build Beyond Dimensions`, `AI + 3D Power`, `Visual No-Code Editor`, `Interactive Scroll Animations`, `Built-In Hosting & Performance`, `Community Showcase`, `Pricing Preview`, `FAQ Accordion`, `Footer`).
  - Top sticky navigation bar with glassmorphic styling, hover mega-menus (`Product`, `Uses`, `Resources`), direct links (`Pricing`, `Enterprise`), and CTA buttons (`Log in`, `Start for FREE` / `Open Builder`).
- **Dedicated Marketing Subpages:**
  - `/features`: Deep dive into UI Builder, 3D Engine, Scroll Keyframing, AI Copilot, and One-Click Publishing.
  - `/pricing`: Interactive **Monthly / Yearly (Save 25%)** billing toggle across `Free ($0)`, `Starter ($18/mo)`, `Pro ($35/mo)`, and `Enterprise (Custom)` tiers, plus feature comparison matrix and FAQ accordion.
  - `/ecommerce`: 3D product configurators, interactive 360° product showcases, and high-converting checkout flows.
  - `/portfolio`: Interactive 3D portfolios for creative directors, 3D artists, and design studios.
  - `/technology`: WebGL 2.0 / Three.js pipeline, Draco/KTX2 asset compression, edge CDN delivery, and shader post-processing.
  - `/storytelling`: Scroll-bound camera choreography, scene state machines, and spatial narrative design.
  - `/gallery`: Filterable showcase of community-built 3D websites with live interactive previews.

### 3.2 Invite-Only Authentication, RBAC & Security Governance
- **No Open Registration:** Direct sign-up without an invitation token is blocked (`403 PUBLIC_REGISTRATION_DISABLED`).
- **CLI Root Admin Bootstrap:** `npm run bootstrap:admin -- --email <email> --password-stdin` provisions the initial `ADMIN` account only when `User.count() === 0`.
- **Single-Use, Expiring Invitation Codes:**
  - Admins issue invitations bound to a normalized email, role (`USER` or `ADMIN`), and expiration window (`1`–`30` days, default `7` days).
  - Raw invitation tokens are returned once at creation/rotation and stored only as `SHA-256` hashes (`tokenHash`).
  - Invitations can be **copied**, **rotated** (invalidating the prior hash and issuing a new link), or **revoked** immediately.
- **Invite Redemption (`/invite/[token]`):**
  - Validates token existence, `PENDING` status, and `expiresAt > now()`.
  - Displays distinct, user-friendly error states for `INVALID`, `EXPIRED`, `REVOKED`, and `ACCEPTED` tokens.
  - Atomically creates the `User` account (`scrypt` password hash), marks the `Invitation` as `ACCEPTED`, creates the user's default personal `Workspace`, and writes an `AuditLog` entry.
- **Audit Logging (`/admin/audit-logs`):**
  - Every security and governance event (`ADMIN_BOOTSTRAP`, `INVITATION_CREATED`, `INVITATION_ROTATED`, `INVITATION_REVOKED`, `INVITATION_ACCEPTED`, `USER_LOGIN`, `USER_ROLE_UPDATED`, `USER_STATUS_UPDATED`, `WEBSITE_PUBLISHED`) is persisted and filterable by action and actor.

### 3.3 PeachWorlds Builder Workspace (`builder.peachworlds.com` Parity)
- **Workspace Shell & Left Sidebar:**
  - Workspace switcher dropdown (Personal Workspace + Team Workspaces + `+ Create a team` modal).
  - Navigation links: `Home` (`/workspace`), `Templates` (`/templates`), `My Websites` (`/my-websites`), `Invites` (`/invites`), `Archive` (`/archive`), `Profile Settings` (`/settings/profile`), `My Templates` (`/settings/my-templates`).
  - Header action bar: `Start with AI` (`/remix`) and `+ New Website` (`Get Started!` modal offering `Start with AI` vs `Browse Templates` vs `Blank 3D Website`).
- **5-Step AI Site Generator Wizard (`/remix`):**
  - **Step 0 (Category):** Select category pill (`Agency`, `AI Tools`, `Consulting`, `CRM`, `Finance`, `Investor`, `SAAS`, `Sales & Marketing`).
  - **Step 1 of 5 (Business Name):** Input project/company name.
  - **Step 2 of 5 (Business Description):** Describe the product/brand value proposition.
  - **Step 3 of 5 (Style Collection):** Choose from visual style collections (`Futuristic Glass`, `Cyber Chrome`, `Editorial Minimal`, `Vibrant Gradient`, `Dark Obsidian`, `Organic Spatial`).
  - **Step 4 of 5 (3D Template Design):** Select a 3D scene template while inspecting a live interactive 3D preview with `Desktop / Tablet / Mobile` viewport switching.
  - **Step 5 of 5 (Brand Color Palette & Generate):** Customize primary, accent, background, and surface hex colors with instant live preview updates, click `Generate` to synthesize tailored copy + 3D material colors, and click `Continue in Builder` to persist and open `/builder/[id]`.

### 3.4 3D WebGL + UI Builder Studio (`/builder/[id]` Parity)
- **Top Studio Bar:**
  - `File` menu (`New Website`, `Save Changes`, `Create Version Snapshot`, `Duplicate Website`, `Export JSON`, `Back to Dashboard`).
  - `Edit` menu (`Undo`, `Redo`, `Copy Selected`, `Delete Selected`, `Reset Camera`).
  - Mode Switcher pill: **`UI`** | **`3D`** | **`Animate`**.
  - Responsive Viewport Switcher: **`Desktop (1280px)`** | **`Tablet (768px)`** | **`Mobile (390px)`** + Zoom indicator.
  - Right actions: `Version History` modal, `Comments` pin drawer, `Share` modal, `Preview` (`/preview/[id]`), and `Publish` modal (publishing live to `/site/[slug]`).
- **Left Rail Drawers:**
  - `Add Elements` (`+`): Insert UI blocks (`Section`, `Container`, `Heading`, `Text Block`, `Button`, `Image`, `Card`, `Form`) or 3D primitives (`Box`, `Sphere`, `Cylinder`, `Torus`, `Cone`, `Plane`, `Directional Light`, `Point Light`).
  - `Styles`: Global Color Palette variables and Typography scale presets.
  - `Pages`: Multi-page manager (create, rename, switch, or delete pages) + Layer Hierarchy tree for both UI elements and 3D scene nodes.
  - `Assets`: Upload/register custom 3D models, textures, and images, or insert built-in 3D presets.
  - `Site Settings`: Website title, subdomain slug, SEO meta description, favicon, and custom CSS/scripts.
- **Right Contextual Inspector:**
  - **In `UI` Mode:** States (`Default`, `Hover`, `Pressed`), Layout (`Flex`/`Block`, direction, align, justify, gap), Size (`W`, `H`, `Min/Max`), Spacing (`Margin` & `Padding` 4-sided box model), Typography (font family, weight, size, color, align), Background & Border (fill color, opacity, border radius), and Scroll Section ID binding.
  - **In `3D` Mode:** Scene Environment (background color, ambient intensity, fog, HDRI preset, camera FOV & position), Post-Processing Effects (`Bloom` intensity/threshold, `Vignette`, `Noise`, `Wireframe` debug), and Selected 3D Node Inspector (`Position X/Y/Z`, `Rotation X/Y/Z`, `Scale X/Y/Z`, Material `Color`, `Emissive`, `Metalness`, `Roughness`, `Opacity`, `Wireframe`, and `Visible` toggle).
  - **In `Animate` Mode:** Bottom Timeline Scrubber (`0%` to `100%` scroll progress + play/pause preview) and Keyframe Track Editor (`Add Keyframe at Current Scroll %`, `Interpolate Camera & Mesh Transforms`, `Delete Keyframe`).

### 3.5 Live Published 3D Site Player (`/site/[slug]`)
- Renders the published snapshot (`publishedVersionId` / `publishedUiStateJson` + `publishedSceneStateJson`) at `/site/[slug]`.
- Supports smooth scroll-bound interpolation of camera transforms and 3D object keyframes, interactive hover states, responsive layouts, and optional "Made with PeachWeb" badge.
