# ViBuild

> AI-powered website builder. Describe your project, and ViBuild generates a complete **.NET + React** application — source code, folder structure, README and all — powered by **Azure OpenAI**.

[![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Azure OpenAI](https://img.shields.io/badge/Azure%20OpenAI-GPT--4-0078D4?logo=microsoftazure)](https://azure.microsoft.com/en-us/products/ai-services/openai-service)

---

## How it works

```
POST /api/projects/generate
        │
        ▼
  Input DTO  ──► JSON payload
        │
        ▼
  MDFiles table
  (skills.md + agents.md + prompt_templates.md)
        │
        ▼
  Azure OpenAI (GPT-4)
        │
        ▼
  Parse LLM response → write files to disk
        │
        ▼
  /GeneratedProjects/ProjectName_timestamp/
        ├── backend/    ← ASP.NET Core Web API
        ├── frontend/   ← React + TypeScript + Vite
        ├── README.md
        └── .gitignore
        │
        ▼
  .zip archive  ──► GET /api/projects/{id}/download
```

---

## Tech Stack

### Backend

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Runtime        | .NET 10 / C# 14                            |
| Web framework  | ASP.NET Core Web API                       |
| ORM            | Entity Framework Core 10                   |
| Database       | PostgreSQL (Npgsql)                        |
| AI             | Azure OpenAI (GPT-4) via `Azure.AI.OpenAI` |
| Authentication | Google OAuth 2.0 (`Google.Apis.Auth`)      |
| API Docs       | Swagger / OpenAPI                          |

### Frontend

| Layer   | Technology                   |
| ------- | ---------------------------- |
| UI      | React 19 + TypeScript        |
| Build   | Vite 8                       |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| Routing | React Router v6              |
| HTTP    | Axios                        |
| Auth    | `@react-oauth/google`        |

---

## Project Structure

```
vi-build/
├── backend/
│   ├── Core/
│   │   ├── ViBuild.Domain/          # Entities, enums
│   │   ├── ViBuild.Infrastructure/  # EF Core, configurations, seeding
│   │   └── ViBuild.Application/     # Services, mappings, Azure OpenAI
│   ├── Common/
│   │   └── ViBuild.Application/     # Shared DTOs
│   ├── Web/
│   │   └── ViBuild.Api/             # Controllers, Program.cs
│   ├── Jobs/
│   │   └── ViBuild.Migration/       # DB migration + SQL seed runner
│   └── GeneratedProjects/           # Output folder for generated apps
└── frontend/
    └── src/
        ├── types/                   # TypeScript API interfaces
        ├── services/                # Axios API client
        ├── contexts/                # Auth context
        ├── components/              # Layout, Navbar, guards, badges
        └── pages/                   # Route-level page components
```

---

## Domain Model

```
User ──────── UserProfile     1 : 0..1
User ──────── UserRole        1 : N
Role ──────── UserRole        1 : N
User ──────── Project         1 : N
Project ───── ProjectFeature  N : M ── Feature
Project ───── LLMLog          1 : N
MDFile                        (standalone — stores prompt context)
```

### Enums (stored as `int` in DB)

| Enum           | Values                                           |
| -------------- | ------------------------------------------------ |
| `MDFileType`   | `Skills=0`, `Agents=1`, `Templates=2`, `Tools=3` |
| `LLMLogStatus` | `Pending=0`, `Success=1`, `Failed=2`             |

---

## API Reference

### Auth

| Method | Route              | Description                  |
| ------ | ------------------ | ---------------------------- |
| `POST` | `/api/auth/google` | Sign in with Google ID token |

### Projects

| Method   | Route                         | Description                   |
| -------- | ----------------------------- | ----------------------------- |
| `GET`    | `/api/projects`               | List all projects             |
| `GET`    | `/api/projects/user/{userId}` | Projects by user              |
| `GET`    | `/api/projects/{id}`          | Get project                   |
| `POST`   | `/api/projects/{userId}`      | Create project                |
| `PUT`    | `/api/projects/{id}`          | Update project                |
| `DELETE` | `/api/projects/{id}`          | Delete project                |
| `POST`   | `/api/projects/generate`      | **Generate full app with AI** |
| `GET`    | `/api/projects/{id}/download` | Download generated `.zip`     |

### Users

| Method   | Route                            | Description    |
| -------- | -------------------------------- | -------------- |
| `GET`    | `/api/users`                     | List users     |
| `GET`    | `/api/users/{id}`                | Get user       |
| `PUT`    | `/api/users/{id}/profile`        | Update profile |
| `DELETE` | `/api/users/{id}`                | Delete user    |
| `POST`   | `/api/users/{id}/roles/{roleId}` | Assign role    |
| `DELETE` | `/api/users/{id}/roles/{roleId}` | Remove role    |

### Roles · Features · LLM Logs · MD Files

| Method                | Route                              | Description        |
| --------------------- | ---------------------------------- | ------------------ |
| `GET/POST/PUT/DELETE` | `/api/roles`                       | Role CRUD          |
| `GET/POST/DELETE`     | `/api/features`                    | Feature CRUD       |
| `GET`                 | `/api/llmlogs/project/{projectId}` | Logs for a project |
| `GET/POST/PUT/DELETE` | `/api/mdfiles`                     | MD file CRUD       |

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL 16+](https://www.postgresql.org/)
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) resource with a GPT-4 deployment
- A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials

### 1. Configure `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ViBuild;Username=postgres;Password=postgres"
  },
  "AzureOpenAI": {
    "Endpoint": "https://YOUR_RESOURCE.openai.azure.com/",
    "ApiKey": "YOUR_API_KEY",
    "DeploymentName": "gpt-4"
  },
  "Generation": {
    "OutputPath": "GeneratedProjects"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

> `Generation:OutputPath` is relative → resolves to `<solution-root>/GeneratedProjects` automatically.  
> Set an absolute path to override.

### 2. Apply migrations & seed

```powershell
cd Jobs/ViBuild.Migration
dotnet run
```

This will:

- Run EF Core migrations against PostgreSQL
- Seed roles (`Admin`, `User`)
- Seed admin user `llleroiv@gmail.com`
- Seed `skills.md`, `agents.md`, `prompt_templates.md` into `MDFiles`

### 3. Run the API

```powershell
cd Web/ViBuild.Api
dotnet run
```

Swagger UI → `https://localhost:{port}/swagger`

---

## Generating a Project

```http
POST /api/projects/generate
Content-Type: application/json

{
  "userId": 1,
  "projectName": "ShopApp",
  "siteType": "ecommerce",
  "features": ["user_login", "shopping_cart", "checkout"],
  "designFramework": "TailwindCSS",
  "theme": "dark",
  "description": "An online store for handmade goods"
}
```

Response:

```json
{
  "projectId": 42,
  "projectName": "ShopApp",
  "archivePath": "...\\GeneratedProjects\\ShopApp_20250101_120000.zip",
  "status": "generated"
}
```

Download the archive:

```http
GET /api/projects/42/download
```

---

## Database Seeding

`DbSeeder` runs automatically on every API startup (idempotent):

| Data       | Value                                           |
| ---------- | ----------------------------------------------- |
| Roles      | `Admin`, `User`                                 |
| Admin user | `llleroiv@gmail.com`                            |
| MD Files   | `skills.md`, `agents.md`, `prompt_templates.md` |

New Google sign-in users are auto-assigned the `User` role and get a profile from their Google account.

---

## Google Authentication Flow

```
Client  ──►  POST /api/auth/google  { "idToken": "..." }
                      │
              Validate with Google.Apis.Auth
                      │
              Find or create User by email
                      │
              Return { userId, email, fullName, roles[] }
```

---

## Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-5-FF9903?logo=daisyui&logoColor=white)](https://daisyui.com/)

### Tech Stack

| Concern      | Library                                        |
| ------------ | ---------------------------------------------- |
| UI framework | React 19 + TypeScript                          |
| Build tool   | Vite 8                                         |
| Styling      | Tailwind CSS v4 + DaisyUI v5                   |
| Routing      | React Router v6                                |
| HTTP client  | Axios (proxied to backend via Vite dev server) |
| Google Auth  | `@react-oauth/google` (implicit flow)          |

### Source Structure

```
frontend/src/
├── types/
│   └── api.ts                 # TypeScript interfaces for all backend DTOs
├── services/
│   └── api.ts                 # Axios client — all API calls (auth, projects, features, logs, MDFiles)
├── contexts/
│   └── AuthContext.tsx        # Google auth state, persisted to localStorage
├── components/
│   ├── Layout.tsx             # App shell (navbar + footer + <Outlet />)
│   ├── Navbar.tsx             # Navigation with Google sign-in / user avatar dropdown
│   ├── ProtectedRoute.tsx     # Redirects unauthenticated users to /login
│   └── StatusBadge.tsx        # Coloured badge for ProjectStatus enum
└── pages/
    ├── LoginPage.tsx          # Hero login page with Google OAuth button
    ├── DashboardPage.tsx      # Stats cards + recent projects grid
    ├── ProjectsPage.tsx       # Projects table with download & delete actions
    ├── NewProjectPage.tsx     # 3-step wizard → Basics → Features → Design & Review → Generate
    ├── ProjectDetailPage.tsx  # Project overview + LLM logs viewer (collapsible prompt / response)
    ├── FeaturesPage.tsx       # Feature list management (admin: add / delete)
    ├── MDFilesPage.tsx        # MD file management with modal editor (admin only)
    └── ProfilePage.tsx        # User profile editor (full name, bio, phone, avatar)
```

### Pages & Routes

| Route           | Page                | Auth     |
| --------------- | ------------------- | -------- |
| `/login`        | `LoginPage`         | Public   |
| `/`             | `DashboardPage`     | Required |
| `/projects`     | `ProjectsPage`      | Required |
| `/projects/new` | `NewProjectPage`    | Required |
| `/projects/:id` | `ProjectDetailPage` | Required |
| `/features`     | `FeaturesPage`      | Required |
| `/mdfiles`      | `MDFilesPage`       | Required |
| `/profile`      | `ProfilePage`       | Required |

### Project Generation Wizard

The **New Project** page is a 3-step guided form that collects all fields required by `POST /api/projects/generate`:

| Step                | Fields                                                                 |
| ------------------- | ---------------------------------------------------------------------- |
| 1 – Basics          | Project name, site type (8 presets), description                       |
| 2 – Features        | Multi-select from features stored in the database                      |
| 3 – Design & Review | Design framework, theme, Figma link — summary review before submission |

On submit the app calls `POST /api/projects/generate`, shows a spinner while the AI works, then redirects to the project detail page with a success banner and a **Download ZIP** button once the archive is ready.

### Google Authentication Flow

```
Browser  ──►  @react-oauth/google implicit flow
                      │
              access_token received
                      │
              POST /api/auth/google  { "idToken": access_token }
                      │
              AuthResponseDto { userId, email, fullName, roles[] }
                      │
              Stored in localStorage + React context
```

Users are automatically created on first sign-in with the `User` role. The `Admin` role unlocks features management, MD files management, and the ability to delete any project.

### Getting Started (Frontend)

**Prerequisites:** Node.js 20+

1. Copy `.env.example` to `.env.local` and fill in your Google Client ID:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

> To obtain a client ID: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application). Add `http://localhost:5173` to **Authorized JavaScript origins**.

2. Install dependencies and start the dev server:

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173` and proxies all `/api/*` requests to `http://localhost:5000` (the .NET backend).

3. Build for production:

```powershell
npm run build
```
