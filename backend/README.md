# ViBuild — Backend API

> AI-powered website builder backend. Users sign in with Google, describe their project, and the system generates a website using LLM pipelines — tracking prompts, responses, features, and generated file artifacts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | .NET 10 / C# 14 |
| Web framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 10 |
| Database | PostgreSQL (Npgsql) |
| Authentication | Google OAuth 2.0 (`Google.Apis.Auth`) |
| API Docs | Swagger / OpenAPI |

---

## Architecture

Clean layered architecture split across five projects:

```
backend/
├── Core/
│   ├── ViBuild.Domain/          # Entities, enums — no dependencies
│   ├── ViBuild.Infrastructure/  # EF Core DbContext, configurations, seeding
│   └── ViBuild.Application/     # Services, mappings — business logic
├── Common/
│   └── ViBuild.Application/     # Shared DTOs (no domain dependency)
├── Web/
│   └── ViBuild.Api/             # Controllers, Program.cs
└── Jobs/
    └── ViBuild.Migration/       # Standalone migration + SQL seed runner
```

---

## Domain Model

```
User ──────────────── UserProfile   (1 : 0..1)
User ──────────────── UserRole      (1 : N)
Role ──────────────── UserRole      (1 : N)
User ──────────────── Project       (1 : N)
Project ───────────── ProjectFeature (N : M) ── Feature
Project ───────────── LLMLog        (1 : N)
MDFile                               (standalone)
```

### Enums

| Enum | Values |
|---|---|
| `MDFileType` | `Skills=0`, `Agents=1`, `Templates=2`, `Tools=3` |
| `LLMLogStatus` | `Pending=0`, `Success=1`, `Failed=2` |

---

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/google` | Sign in with Google ID token |

### Users
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/{id}` | Get user by ID |
| `PUT` | `/api/users/{id}/profile` | Update user profile |
| `DELETE` | `/api/users/{id}` | Delete user |
| `POST` | `/api/users/{id}/roles/{roleId}` | Assign role to user |
| `DELETE` | `/api/users/{id}/roles/{roleId}` | Remove role from user |

### Roles
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/roles` | List all roles |
| `GET` | `/api/roles/{id}` | Get role by ID |
| `POST` | `/api/roles` | Create role |
| `PUT` | `/api/roles/{id}` | Update role |
| `DELETE` | `/api/roles/{id}` | Delete role |

### Projects
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/projects/user/{userId}` | List projects by user |
| `GET` | `/api/projects/{id}` | Get project by ID |
| `POST` | `/api/projects/{userId}` | Create project for user |
| `PUT` | `/api/projects/{id}` | Update project |
| `DELETE` | `/api/projects/{id}` | Delete project |

### Features
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/features` | List all features |
| `GET` | `/api/features/{id}` | Get feature by ID |
| `POST` | `/api/features` | Create feature |
| `DELETE` | `/api/features/{id}` | Delete feature |

### LLM Logs
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/llmlogs/project/{projectId}` | Get logs for a project |
| `GET` | `/api/llmlogs/{id}` | Get log by ID |

### MD Files
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/mdfiles` | List all MD files |
| `GET` | `/api/mdfiles/{id}` | Get file by ID |
| `POST` | `/api/mdfiles` | Create MD file |
| `PUT` | `/api/mdfiles/{id}` | Update MD file |
| `DELETE` | `/api/mdfiles/{id}` | Delete MD file |

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL](https://www.postgresql.org/)
- A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials

### 1. Configure connection string

In `Web/ViBuild.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=vibuild;Username=postgres;Password=yourpassword"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

### 2. Apply migrations

```powershell
cd Core/ViBuild.Infrastructure
dotnet ef database update --startup-project ../../Web/ViBuild.Api
```

Or use the dedicated migration job:

```powershell
cd Jobs/ViBuild.Migration
# configure appsettings.json with ConnectionStrings:ViBuild and Seeding:SeedDataPath
dotnet run
```

### 3. Run the API

```powershell
cd Web/ViBuild.Api
dotnet run
```

Swagger UI is available at `https://localhost:{port}/swagger` in development.

---

## Database Seeding

On every API startup, `DbSeeder` runs automatically and is idempotent:

| Seed | Value |
|---|---|
| Roles | `Admin`, `User` |
| Admin user | `llleroiv@gmail.com` |

New users who sign in via Google are automatically assigned the `User` role and get a profile created from their Google account data.

---

## Google Authentication Flow

```
Client  →  POST /api/auth/google  { "idToken": "..." }
           ↓
           Validate token via Google.Apis.Auth
           ↓
           Find or create User by email
           ↓
           Return { userId, email, fullName, roles[] }
```
