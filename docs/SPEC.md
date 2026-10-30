# Technical Specification (SPEC) — PeachWeb & PeachWorlds Platform

## 1. System Overview
This specification defines the routes, API contracts, authentication/admission rules, 3D scene/UI state schemas, and interactive workflows for the PeachWeb & PeachWorlds platform built with **Next.js (App Router, TypeScript)**, **Auth.js / NextAuth (v4 database sessions)**, **Prisma 7 (SQLite local / PostgreSQL prod)**, and **Three.js (WebGL)**.

---

## 2. Route Specification

### 2.1 Public Marketing Routes (`peachweb.io` Parity)
| Route | Access | Description |
|---|---|---|
| `/` | Public | Interactive 3D scroll-driven homepage with sticky navbar, `Product`/`Uses`/`Resources` mega-menus, 3D WebGL background canvas, feature showcases, pricing preview, FAQ, and footer. |
| `/features` | Public | Visual UI builder, 3D WebGL scene studio, scroll keyframe animation, and AI site generation capabilities. |
| `/pricing` | Public | Monthly/Annual pricing toggle (`Free`, `Starter`, `Pro`, `Enterprise`), feature comparison matrix, and FAQ. |
| `/ecommerce` | Public | 3D e-commerce product configurator and spatial storefront showcase. |
| `/portfolio` | Public | Interactive 3D creative portfolio showcase and templates preview. |
| `/technology` | Public | Deep dive into the Three.js WebGL 2.0 engine, shader post-processing, and asset pipeline. |
| `/storytelling` | Public | Scroll-bound camera choreography and interactive 3D narrative showcase. |
| `/gallery` | Public | Filterable gallery of published 3D websites with category tabs and live preview links. |

### 2.2 Authentication & Invite Admission Routes
| Route | Access | Description |
|---|---|---|
| `/login` | Public (Guest) | PeachWorlds split-screen login page (left: credentials + magic/invite token entry & inline validation; right: 3D PeachWeb artwork panel). |
| `/register` | Public | Invite-only gate page explaining that registration requires a valid single-use invitation link (`/invite/[token]`). |
| `/invite/[token]` | Public | Server-validated invitation redemption page. Displays invitee email, role, expiration timestamp, and registration form (`name`, `password`) when `PENDING`, or explicit error states for `INVALID`, `EXPIRED`, `REVOKED`, and `ACCEPTED`. |

### 2.3 Authenticated Builder Workspace Routes (`builder.peachworlds.com` Parity)
| Route | Access | Description |
|---|---|---|
| `/workspace` | Authenticated | Main PeachWorlds dashboard (`Start from Scratch` / `Start with AI`, featured templates, recent websites, workspace switcher, `+ New Website` modal). |
| `/templates` | Authenticated | Searchable, category-filterable 3D website templates catalog (`All`, `SaaS`, `Agency`, `Portfolio`, `E-Commerce`, `AI Tools`, `Storytelling`). |
| `/templates/[id]` | Authenticated | Template detail view with live 3D preview, tags, description, and `Use Template` button that clones the template into a new `Website` and opens `/builder/[id]`. |
| `/my-websites` | Authenticated | Grid/list of active websites in the current workspace with search, sort, `Open in Builder`, `Rename`, `Duplicate`, `Publish`, and `Archive` actions. |
| `/invites` | Authenticated | Workspace team member invitations & pending workspace invites view. |
| `/archive` | Authenticated | Archived websites with `Restore` and `Permanently Delete` actions. |
| `/settings/profile` | Authenticated | User profile settings (display name, bio, avatar color, password update, session security info). |
| `/settings/my-templates` | Authenticated | User-saved custom templates created from their own websites. |
| `/remix` | Authenticated | 5-step AI 3D Site Generator Wizard (`Category` -> `Business Name` -> `Business Description` -> `Style Collection` -> `3D Design + Live Preview` -> `Color Palette Customization + Generate`). |

### 2.4 3D Builder Studio & Published Site Routes
| Route | Access | Description |
|---|---|---|
| `/builder/[id]` | Authenticated (Workspace Member/Admin) | Full-screen 3D WebGL + UI Builder Studio (`UI`, `3D`, `Animate` modes, Left Rail drawers, Right Contextual Inspector, Version History, Comments, Share, Preview, Publish). |
| `/preview/[id]` | Authenticated (Workspace Member/Admin) | Full-screen interactive runtime preview of the current working state of website `[id]` with device frame toggle. |
| `/site/[slug]` | Public | Live published 3D website player rendering the latest published snapshot (`publishedUiStateJson` + `publishedSceneStateJson`) with scroll-driven 3D animations. |

### 2.5 Admin Governance Console Routes
| Route | Access | Description |
|---|---|---|
| `/admin/invitations` | Authenticated (`ADMIN`) | Create single-use expiring invitations, copy one-time invite URLs, rotate tokens, revoke pending invitations, and manage registered users (`role` & `status`). |
| `/admin/audit-logs` | Authenticated (`ADMIN`) | Immutable security and operational audit trail with filtering by action type, actor, and target. |

---

## 3. REST & JSON API Specification

### 3.1 Authentication & Invite Admission APIs
- `POST /api/auth/[...nextauth]`: NextAuth database-session handler with Credentials provider (`email` + `password` verified via `scrypt`).
- `POST /api/register`: Disabled public endpoint (`403 { code: "PUBLIC_REGISTRATION_DISABLED" }`).
- `GET /api/invitations/[token]`: Validates raw invitation token (`200 { invitation: { email, role, status, expiresAt } }` or `404`/`410`).
- `POST /api/invitations/accept`: Accepts `{ token, name, password }`, validates password policy (`>= 8` chars, letter + number), atomically transitions `Invitation` from `PENDING` to `ACCEPTED`, creates `User` + default `Workspace`, records `INVITATION_ACCEPTED` audit log, and returns `201`.
- `GET /api/admin/invitations`: (`ADMIN` only) Lists all invitations (`PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED`) and users.
- `POST /api/admin/invitations`: (`ADMIN` only) Creates or rotates a single-use invitation for `{ email, role, expiresInDays }`, returns `{ invitation, inviteUrl, rawToken }` once, and logs `INVITATION_CREATED`.
- `PATCH /api/admin/invitations/[id]`: (`ADMIN` only) Supports `{ action: "revoke" }` or `{ action: "rotate", expiresInDays }`, logging `INVITATION_REVOKED` or `INVITATION_ROTATED`.
- `PATCH /api/admin/users/[id]`: (`ADMIN` only) Updates user `{ role, status }` (`ACTIVE` | `DISABLED`); disabling a user immediately deletes all their `Session` rows and logs `USER_STATUS_UPDATED`.
- `GET /api/admin/audit-logs`: (`ADMIN` only) Returns paginated `AuditLog` entries with optional `action` filter.

### 3.2 Workspace, Website, Version, Comment & AI Remix APIs
- `GET /api/workspaces` & `POST /api/workspaces`: List user workspaces and create new team workspaces (`Create a team` modal) or invite workspace members.
- `GET /api/websites` & `POST /api/websites`: List workspace websites (filtered by `archived`, `search`, `workspaceId`) and create a new website from a template, blank preset, or AI `/remix` wizard specification.
- `GET /api/websites/[id]`, `PATCH /api/websites/[id]`, `DELETE /api/websites/[id]`: Read or update website metadata, `uiStateJson`, `sceneStateJson`, `archived` state, or delete permanently.
- `POST /api/websites/[id]/versions` & `GET /api/websites/[id]/versions`: Create a named `WebsiteVersion` snapshot (`label`, `uiStateJson`, `sceneStateJson`) and restore any prior version.
- `POST /api/websites/[id]/publish`: Publishes the current `uiStateJson` and `sceneStateJson` to `publishedUiStateJson` and `publishedSceneStateJson`, sets `isPublished = true`, assigns/updates `slug`, creates a published `WebsiteVersion`, and records a `WEBSITE_PUBLISHED` `AuditLog` entry.
- `GET /api/websites/[id]/comments` & `POST /api/websites/[id]/comments`: List, create, and resolve spatial/canvas comments pinned to `(pageId, xPercent, yPercent)`.
- `GET /api/profile` & `PATCH /api/profile`: Update current user profile (`name`, `bio`, `avatarColor`, password change).

---

## 4. Document Schema (`PeachDocumentState`)

### 4.1 `UIState` (`uiStateJson`)
```ts
export interface PeachUiElement {
  id: string;
  type: "section" | "container" | "heading" | "text" | "button" | "image" | "card" | "form" | "badge";
  name: string;
  content?: string;
  href?: string;
  src?: string;
  scrollProgressTarget?: number; // 0..1 anchor in 3D timeline
  styles: {
    display?: "flex" | "block" | "grid";
    flexDirection?: "row" | "column";
    alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
    justifyContent?: "flex-start" | "center" | "space-between" | " flex-end";
    gap?: number;
    width?: string;
    height?: string;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    marginTop?: number;
    marginBottom?: number;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
    textAlign?: "left" | "center" | "right";
  };
  hoverStyles?: Partial<PeachUiElement["styles"]>;
  responsiveOverrides?: {
    tablet?: Partial<PeachUiElement["styles"]>;
    mobile?: Partial<PeachUiElement["styles"]>;
  };
  children?: PeachUiElement[];
}

export interface PeachPage {
  id: string;
  name: string;
  slug: string;
  elements: PeachUiElement[];
}

export interface PeachUiState {
  activePageId: string;
  pages: PeachPage[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: number;
  };
}
```

### 4.2 `SceneState` (`sceneStateJson`)
```ts
export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface PeachSceneObject {
  id: string;
  name: string;
  type: "box" | "sphere" | "cylinder" | "torus" | "cone" | "plane" | "icosahedron" | "ring";
  visible: boolean;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
  material: {
    color: string;
    emissive: string;
    emissiveIntensity: number;
    metalness: number;
    roughness: number;
    opacity: number;
    wireframe: boolean;
    transmission?: number;
  };
  floatAnimation?: {
    enabled: boolean;
    speed: number;
    amplitude: number;
    rotationSpeed: number;
  };
}

export interface PeachSceneLight {
  id: string;
  name: string;
  type: "ambient" | "directional" | "point" | "spot";
  color: string;
  intensity: number;
  position: Vector3Tuple;
  visible: boolean;
}

export interface PeachKeyframe {
  id: string;
  scrollProgress: number; // 0.0 to 1.0
  label: string;
  cameraPosition: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  objectTransforms: Record<
    string,
    {
      position: Vector3Tuple;
      rotation: Vector3Tuple;
      scale: Vector3Tuple;
      color?: string;
    }
  >;
}

export interface PeachSceneState {
  environment: {
    backgroundColor: string;
    secondaryGradientColor: string;
    fogColor: string;
    fogDensity: number;
    ambientIntensity: number;
    preset: "peach-aurora" | "cyber-obsidian" | "solar-studio" | "glass-nebula" | "minimal-ivory";
    gridVisible: boolean;
  };
  camera: {
    fov: number;
    position: Vector3Tuple;
    target: Vector3Tuple;
    exposure: number;
  };
  postProcessing: {
    bloomEnabled: boolean;
    bloomIntensity: number;
    bloomThreshold: number;
    noiseEnabled: boolean;
    noiseOpacity: number;
    vignetteEnabled: boolean;
  };
  lights: PeachSceneLight[];
  objects: PeachSceneObject[];
  keyframes: PeachKeyframe[];
}
```
