# 📄 Product Requirements Document (PRD)
## WriteLoft — Collaborative Note-Taking Web App
**Version:** 1.0
**Date:** February 26, 2026
**Status:** Draft

---

## 1. 📌 Product Overview

### 1.1 Product Summary
WriteLoft is a web-based collaborative note-taking application that enables teams, students, and project groups to create, organize, and edit notes in real-time within shared workspaces. It is designed to bridge the gap between simple note-taking and full project collaboration.

### 1.2 Problem Statement
Most note-taking apps are either too personal (no collaboration) or too complex (full project management tools). WriteLoft provides a focused middle ground — a clean, fast, real-time collaborative notes experience organized around projects/workspaces.

### 1.3 Goals
- Allow teams to collaborate on notes in real-time with zero friction
- Organize notes by workspace/project context
- Provide role-based access control for privacy and structure
- Deliver a seamless, cold-start-free experience

### 1.4 Out of Scope (v1.0)
- Mobile native apps (iOS/Android)
- Offline mode
- Video/audio attachments
- AI-generated note summaries (future version)

---

## 2. 👥 Target Users

| User Type | Description |
|---|---|
| **Students** | Group thesis/capstone teams needing shared documentation |
| **Small Teams** | Startups or dev teams managing project notes |
| **Project Groups** | Any group needing organized, shared notes |

---

## 3. 👤 User Roles & Permissions

| Permission | Owner | Editor | Viewer |
|---|---|---|---|
| Create workspace | ✅ | ❌ | ❌ |
| Invite/remove members | ✅ | ❌ | ❌ |
| Create/edit/delete notes | ✅ | ✅ | ❌ |
| View notes | ✅ | ✅ | ✅ |
| Comment on notes | ✅ | ✅ | ✅ |
| Manage roles | ✅ | ❌ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ |

---

## 4. 🧩 Functional Requirements

### 4.1 Authentication & User Management
- **FR-01:** Users can register via email/password or Google OAuth
- **FR-02:** Users can log in and log out securely
- **FR-03:** Users can update their profile (name, avatar)
- **FR-04:** Password reset via email link
- **FR-05:** JWT-based session management via Supabase Auth

### 4.2 Workspaces
- **FR-06:** Authenticated users can create a named workspace
- **FR-07:** Owners can invite members via email or shareable invite link
- **FR-08:** Owners can assign roles (Editor, Viewer) to members
- **FR-09:** Owners can remove members from a workspace
- **FR-10:** Users can belong to multiple workspaces
- **FR-11:** Workspaces display member list with roles

### 4.3 Notes
- **FR-12:** Editors/Owners can create notes inside a workspace
- **FR-13:** Notes support rich text (bold, italic, headings, lists, code blocks, dividers)
- **FR-14:** Notes can be organized into folders or tagged
- **FR-15:** Notes are auto-saved every 3 seconds
- **FR-16:** Notes display last edited timestamp and editor name
- **FR-17:** Owners/Editors can delete notes (with confirmation prompt)

### 4.4 Real-Time Collaboration
- **FR-18:** Multiple users can edit the same note simultaneously
- **FR-19:** Live presence indicators show who is currently viewing/editing
- **FR-20:** Cursor positions of collaborators are visible in the editor
- **FR-21:** Changes sync in real-time via Supabase Realtime + Yjs CRDT
- **FR-22:** Conflict-free merge of simultaneous edits (handled by Yjs)

### 4.5 Version History
- **FR-23:** Every auto-save creates a version snapshot
- **FR-24:** Users can view a list of previous versions with timestamps
- **FR-25:** Users can restore a previous version (Owner/Editor only)

### 4.6 Comments & Mentions
- **FR-26:** Users can leave inline comments on a note
- **FR-27:** Users can @mention teammates in comments
- **FR-28:** Mentioned users receive an in-app notification
- **FR-29:** Comments show author name, avatar, and timestamp

### 4.7 Notifications
- **FR-30:** Users receive notifications for: mentions, workspace invites, note deletions
- **FR-31:** Notification bell icon shows unread count
- **FR-32:** Users can mark notifications as read

---

## 5. 🚫 Non-Functional Requirements

| Requirement | Detail |
|---|---|
| **Performance** | Page load under 2 seconds on standard connection |
| **Real-time Latency** | Collaborative edits sync within 200ms |
| **Availability** | 99.9% uptime target (Vercel + Supabase SLA) |
| **Security** | Row-Level Security (RLS) on all Supabase tables |
| **Scalability** | Supabase free tier supports up to 500MB DB, 2GB bandwidth |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| **Responsiveness** | Fully responsive on desktop and tablet |

---

## 6. 🛠️ Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend | **Next.js 14** (React) | SSR, API routes, Vercel-native |
| Rich Text Editor | **TipTap** + **Yjs** | CRDT-based real-time collaborative editing |
| Auth | **Supabase Auth** | Built-in OAuth, JWT, no cold start |
| Database | **Supabase Postgres** | Relational, cloud-hosted, RLS support |
| Real-time | **Supabase Realtime** | WebSocket-based, always-on |
| Serverless Functions | **Supabase Edge Functions** | Deno/TypeScript, no cold start |
| Frontend Deployment | **Vercel** | Zero cold start, native Next.js support |
| Domain | **Namecheap** | Affordable, DNS management |
| Version Control | **GitHub** | Team collaboration via org/repo |

---

## 7. 🗃️ Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key (Supabase Auth) |
| name | VARCHAR | Display name |
| email | VARCHAR | Unique |
| avatar_url | TEXT | Profile picture URL |
| created_at | TIMESTAMP | Auto |

### `workspaces`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR | Workspace name |
| owner_id | UUID | FK → users.id |
| created_at | TIMESTAMP | Auto |

### `workspace_members`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| workspace_id | UUID | FK → workspaces.id |
| user_id | UUID | FK → users.id |
| role | ENUM | `owner`, `editor`, `viewer` |
| joined_at | TIMESTAMP | Auto |

### `notes`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| workspace_id | UUID | FK → workspaces.id |
| title | VARCHAR | Note title |
| content | JSONB | TipTap/Yjs document state |
| created_by | UUID | FK → users.id |
| updated_by | UUID | FK → users.id |
| updated_at | TIMESTAMP | Auto-updated |
| folder_id | UUID | FK → folders.id (nullable) |

### `note_versions`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| note_id | UUID | FK → notes.id |
| content_snapshot | JSONB | Full content at save time |
| saved_by | UUID | FK → users.id |
| saved_at | TIMESTAMP | Auto |

### `comments`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| note_id | UUID | FK → notes.id |
| user_id | UUID | FK → users.id |
| body | TEXT | Comment content |
| created_at | TIMESTAMP | Auto |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| type | ENUM | `mention`, `invite`, `delete` |
| ref_id | UUID | Reference to related entity |
| is_read | BOOLEAN | Default false |
| created_at | TIMESTAMP | Auto |

---

## 8. 🗺️ System Architecture

```
┌─────────────────────────────────────┐
│          USER (Browser)             │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│     Next.js Frontend (Vercel)       │
│  - Pages, Components, TipTap Editor │
│  - Yjs CRDT sync layer              │
└──────┬───────────────────┬──────────┘
       │ REST/SDK           │ WebSocket
┌──────▼────────┐  ┌───────▼──────────┐
│ Supabase Auth │  │ Supabase Realtime│
│ + Edge Funcs  │  │ (Live collab)    │
└──────┬────────┘  └───────┬──────────┘
       │                   │
┌──────▼───────────────────▼──────────┐
│        Supabase Postgres DB         │
│     (RLS-protected, cloud-hosted)   │
└─────────────────────────────────────┘
```

---

## 9. 🚀 Development Phases & Timeline

| Phase | Scope | Est. Duration |
|---|---|---|
| **Phase 1** | Auth, workspace CRUD, basic note creation | 1–2 weeks |
| **Phase 2** | TipTap rich text editor + Yjs real-time collab | 2–3 weeks |
| **Phase 3** | Comments, @mentions, notifications | 1–2 weeks |
| **Phase 4** | Version history, roles/permissions polish | 1 week |
| **Phase 5** | UI/UX refinement, domain setup, Vercel deployment | 1 week |

**Total Estimated Duration:** ~7–9 weeks

---

## 10. 🔐 Security Considerations

- All Supabase tables protected with **Row-Level Security (RLS)** policies
- Users can only access workspaces they are members of
- Invite links expire after **7 days**
- OAuth tokens managed entirely by Supabase Auth
- HTTPS enforced via Vercel + Namecheap SSL (Let's Encrypt)
- Environment variables stored securely in Vercel's dashboard (never in repo)

---

## 11. 🔮 Future Features (v2.0+)

- AI-powered note summarization
- Export notes as PDF/Markdown
- Mobile responsive PWA
- Offline mode with sync on reconnect
- Embedded file/image uploads
- Public shareable note links
