# TensorFlow – Collaborative Workspace Platform

## Core Features:

A complete team-oriented workspace app designed for collaborative project development with client-server architecture and advanced user roles.

*   **User Roles & Permissions:** Owner, Admin, Project Manager, Moderator, Developer, Builder, Designer, Community Manager, Viewer. Each with specific access levels. (Current implementation focuses on Owner, Admin, and default 'FREE' tier for new users).
*   **Authentication System:** Robust login with email/password (hashed with bcryptjs) and JWT-based sessions via HttpOnly cookies (using `jose`).
*   **SQLite Database:** All application data (users, projects, tasks, etc.) is stored locally in an SQLite database (`db/tensorflow_app.db`) managed by `better-sqlite3`.
*   **Architecture:** Clear separation of concerns:
    *   **Frontend (Next.js App Router):** UI, user interaction.
    *   **BFF (Next.js API Routes `/api/`):** Handles frontend requests, session validation, calls Pod API.
    *   **Pod API (Next.js API Routes `/api/pod/`):** Core business logic, database interactions via `lib/db.ts`.

## Dashboard Overview:

*   Personalized greeting.
*   Overview of main project(s) (Conceptual - data is currently mock).
*   Activity graphs (tasks completed, user activity, contributions, etc.) (Conceptual - data is currently mock).
*   Task status charts and project progression (Conceptual - data is currently mock).

## Project Management Tools:

*   To-Do lists (personal and shared) (Conceptual).
*   Kanban-style boards per project (Conceptual - UI exists with mock data).
*   Calendar/agenda integration (Conceptual - UI exists with mock data).
*   GitHub repository sync for each project (Conceptual).
*   Shared notes and documentation per module/project (Conceptual - UI exists with mock data).
*   File sharing (PDF, ZIP, images, etc.) (Conceptual - UI exists with mock data).
*   Tag system for content, tasks, and roles (Conceptual).
*   Role-based content visibility and actions (Partially implemented via middleware and API checks).

## Team Communication:

*   Internal messaging (comments, mentions) (Conceptual - UI exists with mock data).
*   Teamwide announcements (visible on all dashboards) (Conceptual - UI exists with mock data).
*   Discussion threads per project/task (Conceptual - UI exists with mock data).

## User & Role Management (Admin Tools):

*   User listing and role assignment via Admin Panel.
*   Initial "Owner" account creation:
    1.  Via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD` etc. in `.env.local`) on first database initialization.
    2.  OR, if no "Owner" exists and ENV vars are not set, via a secret setup page: `/setup-initial-admin/7736597984438934465893573478857638358677`.
*   Tracking last login.
*   Admin dashboard with user count and roles distribution chart. System logs and other stats are conceptual.

## Shared Resources:

*   Central file library (Conceptual - UI exists with mock data).
*   Wiki or team knowledge base (Conceptual - UI exists with mock data).
*   Shared code snippets or reusable templates (Conceptual - UI exists with mock data).

## Style Guidelines:

*   Modern clean UI with dark/light theme toggle.
*   Primary colors: shades of blue (`hsl(217.2 91.2% 59.8%)`) and neutral grays.
*   Responsive and accessible design.
*   Sidebar navigation with icons and labels.
*   Graphs and data visuals with smooth animations (Recharts).

## Getting Started

1.  **Environment Variables:**
    Create a `.env.local` file in the `TensorFlow/` root directory. Add at least:
    ```env
    # REQUIRED: For JWT signing. Generate a strong random string (at least 32 characters).
    JWT_SECRET=your_super_secure_jwt_secret_of_at_least_32_characters

    # OPTIONAL: For initial admin user creation if no Owner exists in DB.
    # If these are set, the admin user will be created on first DB init.
    # If not set and no Owner exists, use the secret setup page.
    ADMIN_EMAIL=enzo.prados@gmail.com
    ADMIN_PASSWORD=@Banane123
    # ADMIN_ID, ADMIN_FIRSTNAME, ADMIN_LASTNAME, ADMIN_USERNAME, ADMIN_ROLE (defaults to Owner) can also be set
    
    # OPTIONAL: Override default DB path (default is ./db/tensorflow_app.db)
    # DB_PATH=./db/my_custom_tensorflow_app.db

    # REQUIRED: Public URL of your application
    NEXT_PUBLIC_APP_URL=http://localhost:9002 
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
    This will also compile `better-sqlite3` native bindings.

3.  **Run Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002`. The SQLite database (`tensorflow_app.db`) will be created in the `TensorFlow/db/` directory if it doesn't exist, along with the initial 'users' table and potentially the admin user.

4.  **Initial Admin Setup (if needed):**
    If you did *not* set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` and no 'Owner' user exists in the database, navigate to the secret setup page:
    `http://localhost:9002/setup-initial-admin/7736597984438934465893573478857638358677`
    to create the first 'Owner' account. This page will be disabled if an Owner already exists or if admin credentials are set via environment variables.

```