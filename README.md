### To test out the application, sign in with: 
- email: admin@test.com
- password: password123

# 🧩 Team Task Manager (Full-Stack)

A minimal full-stack web application for managing team projects and tasks with role-based access control (RBAC).

---

## 🚀 Overview

This application allows teams to collaboratively manage projects and tasks with clearly defined roles:

- **Admins** (project owners)
- **Members** (task contributors)

Each user can only access data relevant to their role and assignments.

---

## 🏗️ Tech Stack

### Frontend
- React
- Tailwind CSS
- shadcn/ui

### Backend
- Node.js
- Express

### Database
- PostgreSQL

### ORM
- Prisma

### Architecture
- Separate frontend and backend services

---

## 🔐 Authentication & Authorization

- Email/password authentication
- JWT (JSON Web Tokens) for session handling
- Role-Based Access Control (RBAC) enforced at API level

---

## 👥 Roles & Permissions

### Admin
- Create, update, delete projects
- Create, update, delete tasks
- Assign projects to users
- Access only their own projects

### Member
- View assigned projects
- View tasks within assigned projects
- Update task status only
- No access to unrelated projects

---

## 📦 Core Features

### 1. Project Management

Each project includes:
- `title`
- `description`
- `dueDate`
- `priority`
- `createdBy`
- `assignees`

**Behavior:**
- Admin assigns users from existing users list
- Projects are isolated per admin

---

### 2. Task Management

Each project contains multiple tasks:

- Admin:
  - Create / update / delete tasks
- Member:
  - Update task status only

Each task includes:
- `status` (Todo / In Progress / Done)
- `completedBy`

**UI Requirement:**
- Display `completed by <user>` in muted text when task is completed

---

### 3. Progress Tracking

- Progress bar per project
- Based on completed vs total tasks

---

### 4. Dashboard

Displays:
- Total tasks
- Completed tasks
- Pending tasks
- Overdue tasks

(No charts — simple aggregated counts)

---

## 🗄️ Backend Requirements

- RESTful APIs using Express
- Prisma for schema & queries
- PostgreSQL with:
  - Proper relations (Users ↔ Projects ↔ Tasks)
  - Constraints & validations
- RBAC enforced via middleware

---

## 🎨 Frontend Requirements

- Built with React
- Styled using Tailwind CSS + shadcn/ui
- UI should be:
  - Minimal
  - Functional
  - Clean (internal tool style)

---

## ⚙️ Project Structure (Suggested)

```

/client        → React frontend
/server        → Express backend
/prisma        → Prisma schema & migrations

````

---

## ▶️ Getting Started

### 1. Clone the Repository
```bash
git clone <repo-url>
cd team-task-manager
````

### 2. Setup Backend

```bash
cd server
npm install
```

Create `.env`:

```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
```

Run migrations:

```bash
npx prisma migrate dev
```

Start server:

```bash
npm run dev
```

---

### 3. Setup Frontend

```bash
cd client
npm install
npm run dev
```

---

## ✅ Additional Notes

* Maintain strict separation of frontend and backend
* Focus on usability and correctness
* Avoid unnecessary features — keep it simple and practical

---

## 📌 Assignment Reference

This project follows the requirements defined in the assignment: 

---

## 🧑‍💻 Author

Your Name Here

---

## 📄 License

MIT License (or as applicable)
