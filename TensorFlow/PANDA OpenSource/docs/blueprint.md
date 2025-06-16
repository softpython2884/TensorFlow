# **App Name**: TensorFlow – Collaborative Workspace Platform

## Core Features:

- **Authentication & User Management:** Secure login, registration (controlled), user roles (Owner, Admin, Project Manager, Developer, Viewer, etc.), profile management. Admin panel for user listing and role changes.
- **Database:** Local SQLite database (`tensorflow_app.db`) for all persistent data, managed via `better-sqlite3`.
- **Project Management:**
    - Create, view, update, delete projects.
    - Assign team members (conceptual).
    - Track project status and progression.
- **Task Management:**
    - Kanban boards per project (To Do, In Progress, In Review, Done).
    - Create, view, update, delete tasks.
    - Assign tasks, set priorities, due dates, tags (conceptual for some details).
- **Dashboard:** Personalized overview, activity feeds, project summaries, task status charts.
- **Shared Resources (Conceptual for advanced features):**
    - File sharing per project.
    - Notes/documentation per project.
    - Central knowledge base & code snippets.
- **Communication (Conceptual):** Internal messaging, announcements, discussion threads.
- **Admin Panel:** User management, role assignment, system logs (conceptual for logs), system settings (conceptual).
- **API Structure:**
    - **BFF (`/api/...`):** Handles frontend requests, validates sessions, calls Pod API.
    - **Pod (`/api/pod/...`):** Core business logic, all database interactions via `src/lib/db.ts`.

## Style Guidelines:

- **Theme:** Modern, clean, professional. Dark/Light mode toggle.
- **Primary Colors:** Shades of blue (e.g., `hsl(var(--primary))`).
- **Accent Colors:** Neutral grays, complementary blues.
- **UI Components:** ShadCN UI.
- **Styling:** Tailwind CSS.
- **Layout:** Responsive design with a main sidebar for navigation and a header for search/user actions.
- **Visuals:** Graphs and charts using Recharts for data visualization on the dashboard.
- **Icons:** Lucide React.

## Key Technical Decisions (from PANDA influence):

- **Next.js App Router:** For routing and server components.
- **TypeScript:** For type safety.
- **SQLite with `better-sqlite3`:** For local, persistent data storage. Database schema managed in `src/lib/db.ts`.
- **JWT Authentication (`jose`):** Secure sessions via HttpOnly cookies.
- **Password Hashing (`bcryptjs`):** Securely store user passwords.
- **Zod Schemas (`src/lib/schemas.ts`):** For input validation at API boundaries and frontend forms.
- **React Hook Form:** For client-side form management.
- **Clear Separation of Concerns:** Frontend -> BFF -> Pod API.
- **Environment Variables (`.env.local`):** For secrets (JWT key, initial admin credentials) and configuration.

## User Roles (Initial Set):

- **Owner:** Full control, can manage admins. (Typically the first user created).
- **Admin:** Manages users, roles, system settings.
- **Project Manager:** Manages specific projects and their teams.
- **Developer:** Works on tasks within projects.
- **Viewer:** Read-only access.
- *(Other roles like Moderator, Builder, Designer, Community Manager can be added as features evolve).*

## Development Workflow & Philosophy:

1.  **Database First (for core entities):** Define schema in `src/lib/db.ts` and `src/lib/schemas.ts`.
2.  **Pod API Layer:** Implement core business logic and database interactions in `/api/pod/...` routes. These routes are the source of truth.
3.  **BFF API Layer:** Create `/api/...` routes that act as intermediaries, validating user sessions (from cookies) and calling the Pod API (passing JWTs in headers).
4.  **Frontend Components & Pages:** Build UI components that consume data from BFF APIs.
5.  **Authentication & Authorization:** Implement JWT-based auth and RBAC in `middleware.ts` and within API routes.
6.  **Iterate:** Add features module by module (e.g., Users, then Projects, then Tasks).
