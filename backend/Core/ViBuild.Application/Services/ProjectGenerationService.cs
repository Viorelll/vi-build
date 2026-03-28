using System.IO.Compression;
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
        var projectJson = BuildProjectJson(request);

        // 2. Load prompt context from MDFiles table
        var skills  = await GetMDContentAsync(MDFileType.Skills);
        var agents  = await GetMDContentAsync(MDFileType.Agents);
        var template = await GetMDContentAsync(MDFileType.Templates);

        // 3. Build prompts
        var systemPrompt = BuildSystemPrompt(skills, agents);
        var userPrompt   = BuildUserPrompt(template, projectJson);

        // 4. Persist Project with status "generating"
        var timestamp  = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var folderName = $"{Sanitize(request.ProjectName)}_{timestamp}";

        var project = new Project
        {
            Name            = request.ProjectName,
            UserId          = request.UserId,
            SiteType        = request.SiteType,
            JsonInput       = projectJson,
            DesignFramework = request.DesignFramework,
            Theme           = request.Theme,
            FigmaLink       = request.FigmaLink,
            Status          = ProjectStatus.Generating
        };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // 5. Call Azure OpenAI
        string llmResponse;
        int tokensUsed;
        try
        {
            (llmResponse, tokensUsed) = await _openAI.CompleteAsync(systemPrompt, userPrompt);
        }
        catch (Exception ex)
        {
            await SaveLogAsync(project, userPrompt, ex.Message, 0, LLMLogStatus.Failed);
            project.Status = ProjectStatus.Failed;
            await _context.SaveChangesAsync();
            throw;
        }

        // 6. Write project files to disk
        var projectPath = Path.Combine(_outputPath, folderName);
        WriteProjectFiles(projectPath, request, llmResponse);

        // 7. Package as .zip archive
        var archivePath = $"{projectPath}.zip";
        if (File.Exists(archivePath)) File.Delete(archivePath);
        ZipFile.CreateFromDirectory(projectPath, archivePath);
        try { Directory.Delete(projectPath, recursive: true); } catch { /* non-critical */ }

        // 8. Persist LLMLog and finalise Project
        await SaveLogAsync(project, userPrompt, llmResponse, tokensUsed, LLMLogStatus.Success);
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

    // ── Prompt builders ───────────────────────────────────────────────────────

    private string BuildProjectJson(GenerateProjectRequestDto r) =>
        JsonSerializer.Serialize(new
        {
            projectName     = r.ProjectName,
            siteType        = r.SiteType,
            features        = r.Features,
            designFramework = r.DesignFramework,
            theme           = r.Theme,
            figmaLink       = r.FigmaLink,
            description     = r.Description
        }, new JsonSerializerOptions { WriteIndented = true });

    private async Task<string> GetMDContentAsync(MDFileType type) =>
        (await _context.MDFiles
            .Where(f => f.FileType == type)
            .OrderBy(f => f.CreatedAt)
            .FirstOrDefaultAsync())?.Content ?? string.Empty;

    private static string BuildSystemPrompt(string skills, string agents) => $$"""
        You are an expert software architect and full-stack code generator.

        ## Skills & Technologies
        {{skills}}

        ## Agent Roles
        {{agents}}

        Generate a complete .NET + React application with this folder structure:
          /ProjectName_timestamp
              /backend   — ASP.NET Core Web API
              /frontend  — React + TypeScript + Vite
              README.md
              .gitignore

        Respond ONLY with a valid JSON object matching this exact schema — no text outside it:
        {
          "readme":   "<README.md content>",
          "gitignore":"<.gitignore content>",
          "backend":  { "files": [ { "path": "<relative>", "content": "<content>" } ] },
          "frontend": { "files": [ { "path": "<relative>", "content": "<content>" } ] }
        }
        """;

    private static string BuildUserPrompt(string template, string projectJson) =>
        string.IsNullOrWhiteSpace(template)
            ? $"Generate a .NET + React application for this project:\n{projectJson}"
            : template.Replace("{{PROJECT_JSON}}", projectJson);

    // ── File generation ───────────────────────────────────────────────────────

    private static void WriteProjectFiles(
        string projectPath, GenerateProjectRequestDto request, string llmResponse)
    {
        Directory.CreateDirectory(Path.Combine(projectPath, "backend"));
        Directory.CreateDirectory(Path.Combine(projectPath, "frontend"));

        GeneratedProjectSchema? schema = null;
        try
        {
            schema = JsonSerializer.Deserialize<GeneratedProjectSchema>(
                ExtractJson(llmResponse), JsonOptions);
        }
        catch { /* fallback to defaults */ }

        File.WriteAllText(
            Path.Combine(projectPath, "README.md"),
            schema?.Readme ?? DefaultReadme(request));

        File.WriteAllText(
            Path.Combine(projectPath, ".gitignore"),
            schema?.Gitignore ?? DefaultGitignore);

        WriteSection(projectPath, "backend",  schema?.Backend?.Files);
        WriteSection(projectPath, "frontend", schema?.Frontend?.Files);
    }

    private static void WriteSection(string root, string section, List<GeneratedFile>? files)
    {
        if (files is null) return;
        foreach (var file in files)
        {
            var full = Path.GetFullPath(Path.Combine(root, section, file.Path.TrimStart('/', '\\')));
            Directory.CreateDirectory(Path.GetDirectoryName(full)!);
            File.WriteAllText(full, file.Content);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task SaveLogAsync(
        Project project, string prompt, string response, int tokens, LLMLogStatus status)
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

// ── Internal LLM response schema ─────────────────────────────────────────────

internal sealed class GeneratedProjectSchema
{
    public string? Readme   { get; set; }
    public string? Gitignore { get; set; }
    public GeneratedSection? Backend  { get; set; }
    public GeneratedSection? Frontend { get; set; }
}

internal sealed class GeneratedSection
{
    public List<GeneratedFile>? Files { get; set; }
}

internal sealed class GeneratedFile
{
    public string Path    { get; set; } = null!;
    public string Content { get; set; } = null!;
}
