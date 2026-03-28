-- Seed: MDFiles (skills.md, agents.md, prompt_templates.md)
-- Idempotent: inserts only when FileName does not already exist

-- skills.md  (FileType = 0)
INSERT INTO "MDFiles" ("FileName", "FileType", "Content", "CreatedAt")
SELECT 'skills.md', 0, $skill$
# Technical Skills

## Backend
- ASP.NET Core Web API (.NET 8+)
- Entity Framework Core with PostgreSQL
- Clean Architecture (Domain, Application, Infrastructure)
- RESTful API design with Swagger / OpenAPI
- JWT Authentication & Authorization

## Frontend
- React 18+ with TypeScript
- Vite build tool
- TailwindCSS for styling
- React Router v6 for navigation
- Axios + React Query for API calls

## DevOps
- Docker + Docker Compose
- GitHub Actions CI/CD
- Environment-based configuration (.env)
$skill$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'skills.md');

-- agents.md  (FileType = 1)
INSERT INTO "MDFiles" ("FileName", "FileType", "Content", "CreatedAt")
SELECT 'agents.md', 1, $agent$
# Agent Roles

## Architect Agent
Designs the overall application structure, API endpoints, and database schema.
Ensures clean separation of concerns and a scalable, maintainable architecture.

## Backend Agent
Generates ASP.NET Core controllers, services, entity classes, and EF Core configurations.
Follows Clean Architecture and SOLID principles throughout.

## Frontend Agent
Generates React components, pages, custom hooks, and API service layers.
Uses TypeScript, functional components, and React best practices.

## DevOps Agent
Creates Dockerfile, docker-compose.yml, .gitignore, and CI/CD pipeline files.
Configures environment variables and deployment scripts.
$agent$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'agents.md');

-- prompt_templates.md  (FileType = 2)
INSERT INTO "MDFiles" ("FileName", "FileType", "Content", "CreatedAt")
SELECT 'prompt_templates.md', 2, $tmpl$
Generate a complete .NET + React application based on the following project specification:

{{PROJECT_JSON}}

## Output Requirements

### Backend (ASP.NET Core Web API)
- Program.cs with full service registrations and middleware pipeline
- One controller per main feature with CRUD endpoints
- Entity classes and EF Core DbContext
- appsettings.json with placeholder connection string and Swagger enabled

### Frontend (React + TypeScript + Vite)
- App.tsx with React Router route definitions
- One page component per main feature
- Shared API service file at src/services/api.ts using Axios
- package.json listing all required dependencies

### Root files
- README.md with project description, prerequisites, setup steps, and usage
- .gitignore covering both .NET and Node.js artifacts

Return ONLY the JSON object. Do not include any explanation or text outside the JSON.
$tmpl$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'prompt_templates.md');
