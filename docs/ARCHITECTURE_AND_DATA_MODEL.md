# Architecture & Data Model — PeachWeb & PeachWorlds

## 1. High-Level System Architecture

```text
+---------------------------------------------------------------------------------------------------+
|                                   Browser / Client Tier                                           |
|                                                                                                   |
|  +---------------------------+  +----------------------------+  +------------------------------+  |
|  | Marketing Surface         |  | PeachWorlds Workspace      |  | 3D Builder Studio            |  |
|  | (/ , /features, /pricing, |  | (/workspace, /templates,   |  | (/builder/[id], /preview/[id]|  |
|  |  /ecommerce, /portfolio,  |  |  /my-websites, /invites,   |  |  UI Mode | 3D Mode | Animate |  |
|  |  /technology, /gallery)   |  |  /archive, /remix, /admin) |  |  Three.js Canvas + Inspector)|  |
|  +-------------+-------------+  +--------------+-------------+  +--------------+---------------+  |
|                |                               |                               |                  |
+----------------|-------------------------------|-------------------------------|------------------+
                 | HTTPS / JSON / RSC            | Cookie: next-auth.session-token
                 v                               v                               v
+---------------------------------------------------------------------------------------------------+
|                             Next.js 16 App Router Server Tier                                     |
|                                                                                                   |
|  +----------------------------------+  +-------------------------------------------------------+  |
|  | Account Admission & RBAC Engine  |  | Builder & Workspace Domain Service                    |  |
|  | - NextAuth Database Sessions     |  | - Website CRUD + Dual State (uiState + sceneState)    |  |
|  | - Single-Use SHA-256 Invitations |  | - /remix 5-Step AI Site Synthesizer                   |  |
|  | - CLI Bootstrap Root Admin       |  | - Version Snapshots & One-Click Live Publishing       |  |
|  | - Immutable Audit Logger         |  | - Spatial Canvas Comments & Workspace Teams           |  |
|  +----------------+-----------------+  +---------------------------+---------------------------+  |
|                   |                                                |                              |
|                   +-----------------------+------------------------+                              |
|                                           | Prisma 7 Driver Adapter                               |
+-------------------------------------------|-------------------------------------------------------+
                                            v
                   +-------------------------------------------------+
                   | Persistence Tier                                |
                   | - Local Dev / Test: SQLite (file:./dev.db)      |
                   | - Production: PostgreSQL (DATABASE_URL)         |
                   +-------------------------------------------------+
```

---

## 2. Prisma Relational Data Model (`schema.prisma` & `schema.postgres.prisma`)

### 2.1 Enumerations
- `UserRole`: `USER`, `ADMIN`
- `UserStatus`: `ACTIVE`, `DISABLED`
- `InvitationStatus`: `PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED`
- `WorkspaceRole`: `OWNER`, `ADMIN`, `EDITOR`, `VIEWER`

### 2.2 Core Entities & Relationships

1. **`User`**
   - `id` (`String @id @default(cuid())`)
   - `name` (`String?`)
   - `email` (`String @unique` — canonical lowercase)
   - `emailVerified` (`DateTime?`)
   - `image` (`String?`)
   - `bio` (`String?`)
   - `avatarColor` (`String @default("#ff6b4a")`)
   - `passwordHash` (`String?` — `scrypt$16384$8$1$...`)
   - `role` (`UserRole @default(USER)`)
   - `status` (`UserStatus @default(ACTIVE)`)
   - `invitedById` (`String?` -> self-relation `UserInvitationTree`)
   - `createdAt`, `updatedAt`

2. **`Invitation` (Single-Use, Expiring Account Admission)**
   - `id` (`String @id @default(cuid())`)
   - `email` (`String` — canonical lowercase)
   - `tokenHash` (`String @unique` — `SHA-256` hex of raw 32-byte base64url token)
   - `activeForEmail` (`String? @unique` — set to `email` while `PENDING`, `null` once `ACCEPTED`/`REVOKED`/`EXPIRED`)
   - `role` (`UserRole @default(USER)`)
   - `status` (`InvitationStatus @default(PENDING)`)
   - `expiresAt` (`DateTime`)
   - `invitedById` (`String` -> `User.id`)
   - `acceptedByUserId` (`String? @unique` -> `User.id`)
   - `acceptedAt` (`DateTime?`)
   - `revokedAt` (`DateTime?`)
   - `createdAt`, `updatedAt`

3. **`Account`, `Session`, `VerificationToken` (NextAuth Database Session Models)**
   - Standard `@auth/prisma-adapter` tables. Disabling a `User` or revoking access deletes rows in `Session` immediately.

4. **`AuditLog` (Immutable Security & Governance Ledger)**
   - `id` (`String @id @default(cuid())`)
   - `actorId` (`String?` -> `User.id`, nullable for CLI bootstrap or unauthenticated failed attempts)
   - `actorEmail` (`String?`)
   - `action` (`String` — e.g., `ADMIN_BOOTSTRAP`, `INVITATION_CREATED`, `INVITATION_ROTATED`, `INVITATION_REVOKED`, `INVITATION_ACCEPTED`, `USER_LOGIN`, `USER_ROLE_UPDATED`, `USER_STATUS_UPDATED`, `WEBSITE_CREATED`, `WEBSITE_PUBLISHED`, `VERSION_RESTORED`)
   - `targetType` (`String` — `USER`, `INVITATION`, `WORKSPACE`, `WEBSITE`)
   - `targetId` (`String?`)
   - `metadataJson` (`String` — serialized JSON details)
   - `ipAddress` (`String?`)
   - `createdAt` (`DateTime @default(now())`)

5. **`Workspace` & `WorkspaceMember` & `WorkspaceInvite`**
   - `Workspace`: `id`, `name`, `slug @unique`, `ownerId`, `plan` (`FREE` | `STARTER` | `PRO` | `ENTERPRISE`), `createdAt`, `updatedAt`.
   - `WorkspaceMember`: `id`, `workspaceId`, `userId`, `role` (`WorkspaceRole`), `joinedAt` (`@@unique([workspaceId, userId])`).
   - `WorkspaceInvite`: `id`, `workspaceId`, `email`, `role` (`WorkspaceRole`), `status` (`PENDING` | `ACCEPTED` | `REVOKED`), `invitedById`, `createdAt`.

6. **`Website` (3D Project Document)**
   - `id` (`String @id @default(cuid())`)
   - `name` (`String`)
   - `slug` (`String @unique` — used for `/site/[slug]`, e.g., `true-vassxk8vrp`)
   - `description` (`String?`)
   - `category` (`String @default("SAAS")`)
   - `thumbnailGradient` (`String @default("linear-gradient(135deg, #ff6b4a 0%, #9333ea 50%, #0f172a 100%)")`)
   - `workspaceId` (`String` -> `Workspace.id`)
   - `ownerId` (`String` -> `User.id`)
   - `templateId` (`String?`)
   - `isArchived` (`Boolean @default(false)`)
   - `isCustomTemplate` (`Boolean @default(false)`)
   - `isPublished` (`Boolean @default(false)`)
   - `publishedAt` (`DateTime?`)
   - `uiStateJson` (`String` — JSON serialized `PeachUiState`)
   - `sceneStateJson` (`String` — JSON serialized `PeachSceneState`)
   - `publishedUiStateJson` (`String?` — immutable snapshot served at `/site/[slug]`)
   - `publishedSceneStateJson` (`String?` — immutable snapshot served at `/site/[slug]`)
   - `createdAt`, `updatedAt`

7. **`WebsiteVersion` (Version History Snapshots)**
   - `id` (`String @id @default(cuid())`)
   - `websiteId` (`String` -> `Website.id`)
   - `label` (`String` — e.g., `"v1.0 Cylinder 3D Scene"`)
   - `uiStateJson` (`String`)
   - `sceneStateJson` (`String`)
   - `createdById` (`String` -> `User.id`)
   - `createdAt` (`DateTime @default(now())`)

8. **`WebsiteComment` (Spatial 3D/UI Canvas Comments)**
   - `id` (`String @id @default(cuid())`)
   - `websiteId` (`String` -> `Website.id`)
   - `authorId` (`String` -> `User.id`)
   - `pageId` (`String @default("home")`)
   - `content` (`String`)
   - `xPercent` (`Float @default(50)`)
   - `yPercent` (`Float @default(35)`)
   - `resolved` (`Boolean @default(false)`)
   - `createdAt` (`DateTime @default(now())`)

9. **`WebsiteAsset` (Workspace / Project 3D & Media Assets)**
   - `id` (`String @id @default(cuid())`)
   - `websiteId` (`String?` -> `Website.id`)
   - `workspaceId` (`String` -> `Workspace.id`)
   - `name` (`String`)
   - `type` (`String` — `"model-3d"` | `"image"` | `"hdri"` | `"video"`)
   - `url` (`String`)
   - `sizeBytes` (`Int @default(0)`)
   - `createdAt` (`DateTime @default(now())`)
