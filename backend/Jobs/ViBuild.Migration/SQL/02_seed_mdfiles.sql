-- Seed: MDFiles — 6 ordered generation step prompts
-- Inserts step rows idempotently.

-- ── Step 1 · Planning & Architecture ─────────────────────────────────────────
INSERT INTO "MDFiles" ("FileName", "Content", "CreatedAt")
SELECT 'step1_planning_architecture.md', $s1$
You are an expert software architect.
Analyse the project specification below and produce a high-level architecture plan.

## Project Specification
{{PROJECT_JSON}}

## Previous Context
{{PREVIOUS_CONTEXT}}

## Output Requirements
- Describe the main layers (Domain, Application, Infrastructure, API, Frontend).
- List all database entities and their relationships.
- List all API endpoint groups.
- Include a README with project description, prerequisites, and folder structure.

Respond ONLY with a valid JSON object in this exact schema — no text outside it:
{
  "readme": "<README.md content>",
  "files": [
    { "path": "ARCHITECTURE.md", "content": "<architecture plan content>" }
  ]
}
$s1$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'step1_planning_architecture.md');

-- ── Step 2 · Models & DB ─────────────────────────────────────────────────────
INSERT INTO "MDFiles" ("FileName", "Content", "CreatedAt")
SELECT 'step2_models_db.md', $s2$
You are a backend developer specialised in .NET and Entity Framework Core.
Generate all C# domain entity classes and the EF Core DbContext for the project.

## Project Specification
{{PROJECT_JSON}}

## Architecture Context
{{PREVIOUS_CONTEXT}}

## Output Requirements
- One C# file per entity under `backend/Domain/Entities/`.
- All enums under `backend/Domain/Enums/`.
- A single `AppDbContext.cs` under `backend/Infrastructure/Data/` with all DbSets.
- EF Core Fluent API configuration classes under `backend/Infrastructure/Data/Configurations/`.
- Use nullable reference types; mark required navigation properties appropriately.

Respond ONLY with a valid JSON object in this exact schema — no text outside it:
{
  "files": [
    { "path": "backend/<relative_path>", "content": "<file content>" }
  ]
}
$s2$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'step2_models_db.md');

-- ── Step 3 · Services & Repositories ─────────────────────────────────────────
INSERT INTO "MDFiles" ("FileName", "Content", "CreatedAt")
SELECT 'step3_services_repositories.md', $s3$
You are a backend developer following Clean Architecture and SOLID principles.
Generate all service interfaces and their implementations, plus repository interfaces if needed.

## Project Specification
{{PROJECT_JSON}}

## Architecture & Models Context
{{PREVIOUS_CONTEXT}}

## Output Requirements
- Interfaces under `backend/Application/Services/Interfaces/`.
- Implementations under `backend/Application/Services/`.
- Inject `AppDbContext` directly (no separate repository layer unless the architecture plan requires one).
- All methods must be async and return Task / Task<T>.
- Include DTO classes under `backend/Application/Models/` for request and response objects.

Respond ONLY with a valid JSON object in this exact schema — no text outside it:
{
  "files": [
    { "path": "backend/<relative_path>", "content": "<file content>" }
  ]
}
$s3$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'step3_services_repositories.md');

-- ── Step 4 · Controllers ─────────────────────────────────────────────────────
INSERT INTO "MDFiles" ("FileName", "Content", "CreatedAt")
SELECT 'step4_controllers.md', $s4$
You are a backend developer building ASP.NET Core Web API controllers.
Generate all API controllers based on the services already created.

## Project Specification
{{PROJECT_JSON}}

## Architecture, Models & Services Context
{{PREVIOUS_CONTEXT}}

## Output Requirements
- One controller per main feature under `backend/Controllers/`.
- Decorate with `[ApiController]` and `[Route("api/[controller]")]`.
- Use constructor injection for the corresponding service interface.
- Implement full CRUD endpoints where applicable (GET all, GET by id, POST, PUT, DELETE).
- Return appropriate HTTP status codes (200, 201, 204, 400, 404).
- Include `backend/Program.cs` with service registrations, EF Core setup, and middleware pipeline.
- Include `backend/appsettings.json` with a placeholder connection string.

Respond ONLY with a valid JSON object in this exact schema — no text outside it:
{
  "files": [
    { "path": "backend/<relative_path>", "content": "<file content>" }
  ]
}
$s4$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'step4_controllers.md');

-- ── Step 5 · Swagger / OpenAPI ───────────────────────────────────────────────
INSERT INTO "MDFiles" ("FileName", "Content", "CreatedAt")
SELECT 'step5_swagger_openapi.md', $s5$
You are a backend developer configuring Swagger / OpenAPI for an ASP.NET Core application.
Add or update Swagger configuration so all API endpoints are fully documented.

## Project Specification
{{PROJECT_JSON}}

## Full Backend Context
{{PREVIOUS_CONTEXT}}

## Output Requirements
- Update `backend/Program.cs` to include `AddSwaggerGen` with title, version, and XML comments support.
- Add XML documentation comments (`///`) to every controller action if not already present.
- Add the `backend/<ProjectName>.csproj` file with `<GenerateDocumentationFile>true</GenerateDocumentationFile>`.
- Add a `backend/Properties/launchSettings.json` that opens the Swagger UI on launch.

Respond ONLY with a valid JSON object in this exact schema — no text outside it:
{
  "files": [
    { "path": "backend/<relative_path>", "content": "<file content>" }
  ]
}
$s5$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'step5_swagger_openapi.md');

-- ── Step 6 · UI Config JSON ──────────────────────────────────────────────────
INSERT INTO "MDFiles" ("FileName", "Content", "CreatedAt")
SELECT 'step6_ui_config.md', $s6$
You are a frontend developer building a React + TypeScript + Vite application.
Generate the complete frontend based on the backend API already defined.

## Project Specification
{{PROJECT_JSON}}

## Full Backend Context
{{PREVIOUS_CONTEXT}}

## Output Requirements
- `frontend/package.json` with all required dependencies (React 18, TypeScript, Vite, React Router v6, Axios, React Query, TailwindCSS).
- `frontend/vite.config.ts` with a proxy to `http://localhost:5000` for `/api`.
- `frontend/src/main.tsx` entry point.
- `frontend/src/App.tsx` with React Router route definitions — one route per main feature.
- One page component per feature under `frontend/src/pages/`.
- Shared Axios API service at `frontend/src/services/api.ts`.
- `frontend/index.html`.
- `frontend/tailwind.config.js` and `frontend/postcss.config.js`.
- `.gitignore` covering both .NET and Node.js artefacts.

Respond ONLY with a valid JSON object in this exact schema — no text outside it:
{
  "gitignore": "<.gitignore content>",
  "files": [
    { "path": "frontend/<relative_path>", "content": "<file content>" }
  ]
}
$s6$, NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "MDFiles" WHERE "FileName" = 'step6_ui_config.md');

