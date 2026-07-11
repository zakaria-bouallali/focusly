# TaskPilot — AI-Powered Team Project Management SaaS

[![Laravel 12](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

TaskPilot is a modern, real-time, multi-tenant project management platform engineered with **Laravel 12 (API)**, **Laravel Reverb (WebSockets)**, **React 19 + Vite**, and **Claude AI**.

---

## ✨ Features

- **Multi-Tenant Workspaces & Role-Based Access Control (RBAC):** Create workspaces, invite teammates via email, and assign granular `owner`, `admin`, or `member` roles.
- **Real-Time Kanban Boards:** Drag-and-drop task cards across columns (`To Do`, `In Progress`, `Done`) powered by `@dnd-kit`. All mutations broadcast instantly via **Laravel Reverb** WebSockets to all active workspace users.
- **AI Notes-to-Tasks Parser:** Paste unstructured meeting transcripts, brainstorms, or spec documents. Our integrated **Claude API (`claude-3-5-sonnet`)** service analyzes notes, extracts structured tasks, infers priorities (`low`, `medium`, `high`), and suggests assignees.
- **AI Thread Summarizer:** One-click summarization of long task comment threads using Claude AI.
- **Task Comments & Attachments:** Rich collaboration on tasks with instant notification indicators.
- **Rich Dark Glassmorphic UI:** Built with custom HSL tokens, backdrop blurs, micro-animations, and curated typography (`Inter`).

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────┐
│           React SPA (Vite + Tailwind v4)      │
│               http://localhost:5173          │
└──────────┬────────────────────────┬──────────┘
           │ Axios (CORS/Cookies)   │ Echo WebSockets
           ▼                        ▼
┌──────────────────────┐  ┌────────────────────┐
│   Laravel 12 API     │  │   Laravel Reverb   │
│ http://localhost:8000│  │ ws://localhost:8080│
└──────────┬───────────┘  └────────────────────┘
           │
           ├─► MySQL Database (TaskPilot DB)
           └─► Anthropic Claude API (AiTaskParser)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- PHP 8.2+ & Composer
- Node.js 20+ & npm
- MySQL 8.0+ (or XAMPP MySQL)

### 1. Database Setup
Create a local MySQL database named `taskpilot`:
```sql
CREATE DATABASE taskpilot;
```

### 2. Backend (Laravel API) Setup
```bash
cd focusly-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

Configure `.env` in `taskpilot-api`:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskpilot
DB_USERNAME=root
DB_PASSWORD=

ANTHROPIC_API_KEY=your_claude_api_key_here
```

Start API and WebSocket servers:
```bash
# Terminal 1: Laravel API
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2: Laravel Reverb WebSockets
php artisan reverb:start
```

### 3. Frontend (React + Vite) Setup
```bash
cd focusly-web
npm install
npm run dev
```

Visit **http://localhost:5173** to access the application.

---

## 🧪 Testing

### Backend API Tests (PHPUnit / Pest)
Runs 9 comprehensive automated feature tests covering Auth, Workspace invites, Project creation, and Task status mutations using SQLite in-memory:
```bash
cd taskpilot-api
php artisan test
```

### Frontend Unit Tests (Vitest)
Runs UI utility and component tests in a `jsdom` environment:
```bash
cd taskpilot-web
npm test
```

---

## ☁️ Production Deployment Guide

### Backend — Railway Deployment
1. Create a new project on [Railway.app](https://railway.app).
2. Provision a MySQL database service.
3. Deploy `taskpilot-api` as a PHP repository service.
4. Set production environment variables:
   - `APP_ENV=production`
   - `APP_URL=https://your-api.railway.app`
   - `FRONTEND_URL=https://your-app.vercel.app`
   - `SANCTUM_STATEFUL_DOMAINS=your-app.vercel.app`
   - `SESSION_DOMAIN=.your-app.vercel.app`

### Frontend — Vercel Deployment
1. Import `taskpilot-web` into [Vercel](https://vercel.com).
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Add Environment Variable:
   - `VITE_API_URL=https://your-api.railway.app/api`
