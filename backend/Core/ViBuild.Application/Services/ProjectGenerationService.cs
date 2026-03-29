using System.IO.Compression;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Domain.Entities;
using ViBuild.Domain.Enums;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class ProjectGenerationService : IProjectGenerationService
{
    private readonly ViBuildDbContext _context;
    private readonly IAzureOpenAIService _openAI;
    private readonly string _outputPath;

    private static readonly JsonSerializerOptions JsonOptions =
        new() { PropertyNameCaseInsensitive = true };

    private const string SystemPrompt = """
        You are an expert software architect and full-stack code generator.
        For each step you will be given a prompt template describing exactly what to produce.
        Respond ONLY with a valid JSON object in the exact schema specified in the prompt.
        Do not include any explanation, markdown, or text outside the JSON object.
        """;

    public ProjectGenerationService(
        ViBuildDbContext context,
        IAzureOpenAIService openAI,
        IConfiguration configuration)
    {
        _context = context;
        _openAI = openAI;
        _outputPath = configuration["Generation:OutputPath"]
            ?? Path.Combine(Path.GetTempPath(), "vibuild", "generated");
    }

    public async Task<GenerateProjectResponseDto> GenerateAsync(GenerateProjectRequestDto request)
    {
        // 1. Transform input to JSON
        var loadProjectFeatures = await _context.Features
            .Where(f => request.Features.Contains(f.Id))
            .ToListAsync();
        var projectJson = BuildProjectJson(request, loadProjectFeatures);

        // 2. Persist Project with status "Generating"
        var timestamp  = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");

        var folderName = $"{Sanitize(request.ProjectName)}_{timestamp}";

        var MDFiles = request.MdFileIds.Select((id, index) =>
            new ProjectMDFile { MDFileId = id, StepOrder = index + 1, IsActive = true }).ToList();

        var projectFeatures = request.Features.Select(id => new ProjectFeature { FeatureId = id }).ToList();

        var project = new Project
        {
            Name            = request.ProjectName,
            UserId          = request.UserId,
            SiteType        = request.SiteType,
            JsonInput       = projectJson,
            DesignFramework = request.DesignFramework,
            Theme           = request.Theme,
            FigmaLink       = request.FigmaLink,
            Status          = ProjectStatus.Generating,
            ProjectMDFiles  = MDFiles,
            ProjectFeatures = projectFeatures
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // 3. Load ordered step MD files (project-specific → global fallback)
        var steps = await LoadStepsAsync(project.Id);

        if (steps.Count == 0)
        {
            project.Status = ProjectStatus.Failed;
            await _context.SaveChangesAsync();
            throw new InvalidOperationException(
                "No generation step MD files found. Please seed the MDFiles table first.");
        }

        // 4. Execute steps sequentially, accumulating context and files
        var allFiles         = new List<StepOutputFile>();
        string? readme       = null;
        string? gitignore    = null;
        var previousContext  = new StringBuilder();

        for (var i = 0; i < steps.Count; i++)
        {
            var step = steps[i];
            var stepOrder = i + 1;
            var userPrompt = step.Content
                .Replace("{{PROJECT_JSON}}", projectJson)
                .Replace("{{PREVIOUS_CONTEXT}}",
                    previousContext.Length > 0 ? previousContext.ToString() : "(none)");

            string response;
            int tokens;
            try
            {
                (response, tokens) = await _openAI.CompleteAsync(SystemPrompt, userPrompt);
            }
            catch (Exception ex)
            {
                await SaveLogAsync(project, userPrompt,
                    ex.Message, 0, LLMLogStatus.Failed);
                project.Status = ProjectStatus.Failed;
                await _context.SaveChangesAsync();
                throw;
            }

            await SaveLogAsync(project, userPrompt,
                response, tokens, LLMLogStatus.Success);

            var schema = ParseStepSchema(response);
            if (schema?.Files is { Count: > 0 })
                allFiles.AddRange(schema.Files);
            if (schema?.Readme    is not null) readme    = schema.Readme;
            if (schema?.Gitignore is not null) gitignore = schema.Gitignore;

            previousContext.AppendLine(
                $"\n## Step {stepOrder} ({step.FileName}) Output\n{response}");
        }

        // 5. Write files to disk
        var projectPath = Path.Combine(_outputPath, folderName);
        WriteProjectFiles(projectPath, request, allFiles, readme, gitignore);

        // 6. Package as .zip archive
        var archivePath = $"{projectPath}.zip";
        if (File.Exists(archivePath)) File.Delete(archivePath);
        ZipFile.CreateFromDirectory(projectPath, archivePath);
        try { Directory.Delete(projectPath, recursive: true); } catch { /* non-critical */ }

        // 7. Finalise Project
        project.Status      = ProjectStatus.Generated;
        project.GeneratedAt = DateTime.UtcNow;
        project.FilePath    = archivePath;
        await _context.SaveChangesAsync();

        return new GenerateProjectResponseDto
        {
            ProjectId   = project.Id,
            ProjectName = project.Name,
            ArchivePath = archivePath,
            Status      = project.Status.ToString()
        };
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string BuildProjectJson(GenerateProjectRequestDto r, List<Feature> loadProjectFeatures) =>
        JsonSerializer.Serialize(new
        {
            projectName     = r.ProjectName,
            siteType        = r.SiteType,
            features        = loadProjectFeatures,
            designFramework = r.DesignFramework,
            theme           = r.Theme,
            figmaLink       = r.FigmaLink,
            description     = r.Description
        }, new JsonSerializerOptions { WriteIndented = true });

    private StepOutputSchema? ParseStepSchema(string text)
    {
        try
        {
            return JsonSerializer.Deserialize<StepOutputSchema>(ExtractJson(text), JsonOptions);
        }
        catch { return null; }
    }

    private async Task<List<MDFile>> LoadStepsAsync(int projectId)
    {
        // Use project-specific MDFiles if configured (IsActive = true, ordered by StepOrder)
        var projectSteps = await _context.ProjectMDFiles
            .Where(pm => pm.ProjectId == projectId && pm.IsActive)
            .OrderBy(pm => pm.StepOrder)
            .Include(pm => pm.MDFile)
            .Select(pm => pm.MDFile)
            .ToListAsync();

        if (projectSteps.Count > 0)
            return projectSteps;

        // Fallback: use all global MDFiles ordered by creation sequence.
        return await _context.MDFiles
            .OrderBy(f => f.Id)
            .ToListAsync();
    }

    private static void WriteProjectFiles(
        string projectPath,
        GenerateProjectRequestDto request,
        List<StepOutputFile> allFiles,
        string? readme,
        string? gitignore)
    {
        Directory.CreateDirectory(Path.Combine(projectPath, "backend"));
        Directory.CreateDirectory(Path.Combine(projectPath, "frontend"));

        File.WriteAllText(
            Path.Combine(projectPath, "README.md"),
            readme ?? DefaultReadme(request));

        File.WriteAllText(
            Path.Combine(projectPath, ".gitignore"),
            gitignore ?? DefaultGitignore);

        var projectRoot = Path.GetFullPath(projectPath);
        foreach (var file in allFiles)
        {
            var full = Path.GetFullPath(
                Path.Combine(projectPath, file.Path.TrimStart('/', '\\')));

            if (!full.StartsWith(projectRoot, StringComparison.OrdinalIgnoreCase))
                continue;

            Directory.CreateDirectory(Path.GetDirectoryName(full)!);
            File.WriteAllText(full, file.Content);
        }
    }

    private async Task SaveLogAsync(
        Project project,
        string prompt, string response, int tokens, LLMLogStatus status)
    {
        _context.LLMLogs.Add(new LLMLog
        {
            ProjectId  = project.Id,
            Prompt     = prompt,
            Response   = response,
            TokensUsed = tokens,
            Status     = status
        });
        await _context.SaveChangesAsync();
    }

    private static string ExtractJson(string text)
    {
        var s = text.Contains("```json")
            ? text[(text.IndexOf("```json") + 7)..]
            : text;
        if (s.Contains("```")) s = s[..s.IndexOf("```")];
        var start = s.IndexOf('{');
        var end   = s.LastIndexOf('}');
        return start >= 0 && end > start ? s[start..(end + 1)] : text;
    }

    private static string DefaultReadme(GenerateProjectRequestDto r) => $"""
        # {r.ProjectName}

        **Type:** {r.SiteType}  
        **Framework:** {r.DesignFramework ?? "N/A"}  
        **Theme:** {r.Theme ?? "N/A"}

        ## Features
        {string.Join("\n", r.Features.Select(f => $"- {f}"))}

        ## Structure
        ```
        /backend   — ASP.NET Core Web API
        /frontend  — React + TypeScript + Vite
        ```
        """;

    private const string DefaultGitignore = """
        # .NET
        bin/
        obj/
        *.user
        .vs/
        appsettings.Development.json

        # Node
        node_modules/
        dist/
        .env
        .env.local

        # IDE
        .idea/
        .vscode/
        """;

    private static string Sanitize(string name) =>
        new(name.Select(c => char.IsLetterOrDigit(c) ? c : '_').ToArray());
}

// ── Internal step output schema ───────────────────────────────────────────────

internal sealed class StepOutputSchema
{
    public string? Readme    { get; set; }
    public string? Gitignore { get; set; }
    public List<StepOutputFile>? Files { get; set; }
}

internal sealed class StepOutputFile
{
    public string Path    { get; set; } = null!;
    public string Content { get; set; } = null!;
}
