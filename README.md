<div align="center">

# <img src="src/app/favicon/WriteLoft_Newlogo [881BCE4].png" alt="WriteLoft Logo" width="200">

[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A real-time **collaborative note-taking web app** designed for teams, students, and project groups. This modern platform provides role-based workspaces, real-time rich text editing, and instant synchronization, facilitating seamless teamwork and document management.

</div>

## Project Overview

**WriteLoft** is a web-based collaborative note-taking application where teams can create shared workspaces, write and edit notes together in real-time, and stay organized around their projects. Think of it as a clean, focused alternative to Notion — built for collaboration from the ground up utilizing the power of Next.js and Supabase.

## Key Features

### ⚡ Real-Time Collaboration
- **Simultaneous Editing**: Multiple users can edit the same note at the same time with live cursors, powered by TipTap and Yjs.
- **Instant Sync**: Real-time synchronization handled securely by Supabase Realtime to ensure everyone sees the latest changes instantly.

### 🗂️ Workspace Management
- **Project Workspaces**: Create dedicated workspaces for different projects, subjects, or teams.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions with Owner, Editor, and Viewer roles to manage who can edit or just read.
- **Member Invites**: Easily invite teammates to collaborate within your workspaces.

### ✏️ Advanced Rich Text Editing
- **TipTap Editor**: A highly extensible rich text editor supporting headings, interactive lists, code blocks, and rich formatting.
- **Fluid UI**: Clean and minimal interface allowing you to focus purely on the content without distractions.

### 💬 Engagement & History
- **Comments & Mentions**: Inline comments and @mention notifications for seamless in-document communication.
- **Version History**: Auto-saved snapshots with restore capability to never lose your work.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/frostjade71/writeloft.git
   cd writeloft
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**

   Create a `.env.local` file in the root directory based on your Supabase project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXTAUTH_SECRET=your-nextauth-secret
   ```
   > ⚠️ **Note**: Never commit `.env.local` to the repository.

4. **Start the Development Server**

   ```bash
   npm run dev
   ```

5. **Access the System**
   - Open **[http://localhost:3000](http://localhost:3000)** in your browser.

## Database Setup (Supabase)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Run the SQL migration files located in `/supabase/migrations/`
4. Enable **Row-Level Security (RLS)** on all tables
5. Enable **Realtime** on the `notes` table

## Technology Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,supabase,vercel,github" alt="Technology Stack" />
</p>

- **Frontend**: Next.js 14+ (React), Tailwind CSS, TypeScript
- **Rich Text / Collab**: TipTap + Yjs (CRDT)
- **Backend/Auth**: Supabase (PostgreSQL, Auth, Realtime Edge Functions)
- **Deployment**: Vercel

## Security Features

- **Row-Level Security (RLS)**: Database tables are strictly protected, ensuring users only access data in their authorized workspaces.
- **Secure Authentication**: Email/password and OAuth login powered securely by Supabase Auth.
- **Protected Routing**: Next.js server actions and middleware strictly enforce authentication rules to prevent unauthorized dashboard access.

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---
