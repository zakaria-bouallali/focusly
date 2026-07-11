# TaskPilot — Build Spec for Claude Code

This is a full build specification for **TaskPilot**, a team project management SaaS with AI-assisted task creation. Use this document as the source of truth for architecture, features, and build order. Ask before making major deviations from the stack or data model below.

---

## 1. Project Overview

TaskPilot is a multi-tenant, Kanban-style project management tool (like a lightweight Linear/Asana). Users create Workspaces, invite teammates with roles, organize work into Projects and Tasks, collaborate in real time, and can turn messy notes into structured tasks using an AI API call.

**Goal of this build:** a fully working, deployable full-stack app demonstrating real auth, RBAC, relational data modeling, real-time updates, and one genuine AI feature — not a toy CRUD demo.

---

## 2. Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Laravel 11 (API-only, decoupled from frontend — no Blade/Inertia)
- **Database:** MySQL, via Eloquent ORM + migrations
- **Auth:** Laravel Sanctum (SPA token auth)
- **Real-time:** Laravel Reverb (WebSocket server) + Laravel Echo on the frontend
- **AI:** Anthropic Claude API, called server-side from a Laravel service class
- **File storage:** Laravel filesystem abstraction, local disk for dev / S3-compatible for prod
- **Testing:** Pest (backend), Vitest + React Testing Library (frontend), one Playwright E2E test for the core flow
- **Deployment:** Laravel backend + MySQL on Railway or Render; React frontend on Vercel or Netlify

Do not substitute a different backend framework, database, or auth approach without asking first.

---

## 3. Repository Structure

Two separate repos/folders (fully decoupled, not a monorepo unless asked):

```
taskpilot-api/      # Laravel backend
taskpilot-web/      # React frontend
```

---

## 4. Data Model

Build these as Laravel migrations + Eloquent models with proper relationships.

```
users
  id, name, email, password, avatar_url, timestamps

workspaces
  id, name, owner_id (FK -> users), timestamps

workspace_members
  id, workspace_id (FK), user_id (FK), role (enum: owner, admin, member), timestamps
  unique(workspace_id, user_id)

projects
  id, workspace_id (FK), name, description, timestamps

tasks
  id, project_id (FK), title, description, status (enum: todo, in_progress, done),
  priority (enum: low, medium, high), assignee_id (FK -> users, nullable),
  due_date (nullable), created_by (FK -> users), timestamps

comments
  id, task_id (FK), user_id (FK), body, timestamps

attachments
  id, task_id (FK), url, filename, uploaded_by (FK -> users), timestamps

notifications
  id, user_id (FK), type, payload (json), read (boolean, default false), timestamps
```

Eloquent relationships to implement:
- `User hasMany WorkspaceMember`, `belongsToMany Workspace through workspace_members`
- `Workspace hasMany Project`, `belongsTo User (owner)`
- `Project hasMany Task`
- `Task belongsTo Project`, `belongsTo User (assignee)`, `hasMany Comment`, `hasMany Attachment`

---

## 5. Auth & RBAC

- Use **Sanctum** for SPA token auth (login, register, logout, `/api/user` endpoint).
- Roles: `owner`, `admin`, `member` — scoped per-workspace via `workspace_members.role`, not a global user role.
- Implement Laravel **Policies** for `Project` and `Task` models:
  - `owner`/`admin` can create/edit/delete projects and manage members
  - `member` can create/edit tasks and comments but cannot delete projects or change roles
  - Enforce every permission check server-side in the policy/controller — never rely on frontend hiding alone.
- Middleware should reject any request to a workspace's resources if the authenticated user isn't a member of that workspace.

---

## 6. API Endpoints

```
POST   /api/register
POST   /api/login
POST   /api/logout
GET    /api/user

GET    /api/workspaces
POST   /api/workspaces
POST   /api/workspaces/{workspace}/invite
GET    /api/workspaces/{workspace}/members

GET    /api/workspaces/{workspace}/projects
POST   /api/workspaces/{workspace}/projects

GET    /api/projects/{project}/tasks
POST   /api/projects/{project}/tasks
PATCH  /api/tasks/{task}
DELETE /api/tasks/{task}

POST   /api/tasks/{task}/comments
POST   /api/tasks/{task}/attachments

POST   /api/ai/parse-notes         # notes text -> structured task suggestions
POST   /api/ai/summarize-thread    # task id -> AI summary of its comments

GET    /api/notifications
PATCH  /api/notifications/{id}/read
```

All routes except register/login require `auth:sanctum`.

---

## 7. Real-Time

- Set up **Laravel Reverb** as the WebSocket server.
- Broadcast events on: task created/updated/moved, new comment added.
- Frontend subscribes via **Laravel Echo** to a per-workspace private channel (`workspace.{id}`), authorized through Sanctum.
- When a task is updated by one user, all other users viewing that project's board should see it update live without a page refresh.

---

## 8. AI Feature (Required)

Build a Laravel service class (`app/Services/AiTaskParser.php`) that:
1. Accepts a raw text blob (e.g. pasted meeting notes)
2. Sends it to the Claude API with a prompt instructing it to return **strict JSON**: an array of `{title, description, suggested_priority, suggested_assignee_name}`
3. Parses and validates the JSON response
4. Returns it to the frontend, where the user reviews/edits the suggestions in a modal before confirming — confirmed items are created as real Task records via the normal task-creation endpoint

Store the Anthropic API key in `.env` as `ANTHROPIC_API_KEY`. Never commit it. Handle API errors gracefully (timeout, malformed JSON) with a user-facing error message, not a raw stack trace.

---

## 9. Frontend Pages/Views

- `/login`, `/register`
- `/workspaces` — list + create workspace
- `/workspaces/:id` — projects list within a workspace
- `/projects/:id` — Kanban board (columns: Todo, In Progress, Done), drag-and-drop to change status
- `/projects/:id/tasks/:taskId` — task detail modal/page: description, comments, attachments, AI summarize button
- `/projects/:id/import` — paste-notes-to-AI-tasks flow
- Notification bell in the top nav, dropdown with unread notifications

Use Tailwind for styling. Keep components reasonably small and reusable (`TaskCard`, `KanbanColumn`, `WorkspaceMemberList`, etc.).

---

## 10. Build Order (do this sequentially, confirm each phase works before moving on)

1. **Laravel API skeleton** — install Laravel, set up MySQL connection, run first migration for `users`
2. **Auth** — Sanctum registration/login/logout, verify with a simple curl/Postman test
3. **Workspaces + members + roles** — migrations, models, policies, endpoints
4. **Projects + Tasks CRUD** — migrations, models, policies, endpoints
5. **React app skeleton** — Vite + Tailwind + routing, connect to API, build login/register flow
6. **Workspace + project UI** — list/create views
7. **Kanban board** — task CRUD UI, drag-and-drop
8. **Comments + attachments**
9. **Real-time** — Reverb + Echo wiring, live task updates
10. **AI feature** — service class, endpoint, frontend modal flow
11. **Notifications**
12. **Tests** — Pest backend tests for auth/policies, one Playwright E2E for signup → create workspace → create task → AI-generate tasks
13. **Polish + deploy** — landing page, guest/demo mode, deploy API + MySQL + frontend, write README

---

## 11. Definition of Done

- All endpoints in Section 6 implemented and enforce RBAC correctly
- Real-time task updates work across two browser sessions
- AI notes-to-tasks flow works end-to-end with a real Claude API call
- App is deployed with a working live URL
- README includes setup instructions, architecture summary, and screenshots
- Basic test suite passes (`php artisan test`, `npm test`, one E2E test)

Ask before skipping any section above or substituting a different tool/library than what's specified.
