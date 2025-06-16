# TensorFlow – Collaborative Workspace Platform

## Core Features:

A complete team-oriented workspace app designed for collaborative project development with client-server architecture and advanced user roles.

*   **User Roles & Permissions:** Owner, Admin, Project Manager, Moderator, Developer, Builder, Designer, Community Manager, Viewer. Each with specific access levels.
*   **Authentication System:** Robust login with email/password (hashed) and JWT-based sessions via HttpOnly cookies.
*   **SQLite Database:** All application data (users, projects, tasks, etc.) is stored locally in an SQLite database.
*   **Architecture:** Clear separation of concerns:
    *   **Frontend (Next.js App Router):** UI, user interaction.
    *   **BFF (Next.js API Routes `/api/`):** Handles frontend requests, session validation, calls Pod API.
    *   **Pod API (Next.js API Routes `/api/pod/`):** Core business logic, database interactions via `lib/db.ts`.

## Dashboard Overview:

*   Personalized greeting.
*   Overview of main project(s).
*   Activity graphs (tasks completed, user activity, contributions, etc.).
*   Task status charts and project progression.

## Project Management Tools:

*   To-Do lists (personal and shared).
*   Kanban-style boards per project.
*   Calendar/agenda integration.
*   GitHub repository sync for each project (conceptual).
*   Shared notes and documentation per module/project.
*   File sharing (PDF, ZIP, images, etc.) (conceptual).
*   Tag system for content, tasks, and roles.
*   Role-based content visibility and actions.

## Team Communication:

*   Internal messaging (comments, mentions) (conceptual).
*   Teamwide announcements (visible on all dashboards) (conceptual).
*   Discussion threads per project/task (conceptual).

## User & Role Management (Admin Tools):

*   User listing and role assignment.
*   Admin user creation via a secure setup page or environment variables.
*   Tracking last login and user activity (conceptual).
*   Admin dashboard with user logs and system stats (conceptual).

## Shared Resources:

*   Central file library (conceptual).
*   Wiki or team knowledge base (conceptual).
*   Shared code snippets or reusable templates (conceptual).

## Style Guidelines:

*   Modern clean UI with dark/light theme toggle.
*   Primary colors: shades of blue and neutral grays.
*   Responsive and accessible design.
*   Sidebar navigation with icons and labels.
*   Graphs and data visuals with smooth animations (Recharts).

## Getting Started

1.  **Environment Variables:**
    Create a `.env.local` file in the root directory. Add at least:
    ```env
    JWT_SECRET=your_super_secure_jwt_secret_of_at_least_32_characters

    # Optional: For initial admin user creation if not found in DB
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=SecurePassword123!
    # ADMIN_ID, ADMIN_FIRSTNAME, ADMIN_LASTNAME, ADMIN_USERNAME, ADMIN_ROLE (defaults to Owner) can also be set
    ```
    If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are not set, and no "Owner" user exists, you can create the first admin via the setup page: `/setup-initial-admin/7736597984438934465893573478857638358677` (replace with your actual secret path if different).

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002`. The SQLite database (`tensorflow_app.db`) will be created in the `db/` directory if it doesn't exist.
