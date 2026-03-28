using Microsoft.AspNetCore.Mvc;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;

namespace ViBuild.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly IProjectGenerationService _generationService;

    public ProjectsController(
        IProjectService projectService,
        IProjectGenerationService generationService)
    {
        _projectService    = projectService;
        _generationService = generationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> GetAll() =>
        Ok(await _projectService.GetAllAsync());

    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<List<ProjectDto>>> GetByUser(int userId) =>
        Ok(await _projectService.GetByUserIdAsync(userId));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDto>> GetById(int id)
    {
        var project = await _projectService.GetByIdAsync(id);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost("{userId:int}")]
    public async Task<ActionResult<ProjectDto>> Create(int userId, [FromBody] CreateProjectDto dto)
    {
        var project = await _projectService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProjectDto>> Update(int id, [FromBody] UpdateProjectDto dto)
    {
        var project = await _projectService.UpdateAsync(id, dto);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _projectService.DeleteAsync(id) ? NoContent() : NotFound();

    // ── Generation ────────────────────────────────────────────────────────────

    /// <summary>
    /// Transforms request → JSON → LLM prompt → generates .NET + React project → returns .zip archive path.
    /// </summary>
    [HttpPost("generate")]
    public async Task<ActionResult<GenerateProjectResponseDto>> Generate(
        [FromBody] GenerateProjectRequestDto dto)
    {
        var result = await _generationService.GenerateAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Downloads the generated .zip archive for a project.
    /// </summary>
    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var project = await _projectService.GetByIdAsync(id);
        if (project?.FilePath is null)
            return NotFound("Project archive not found.");
        if (!System.IO.File.Exists(project.FilePath))
            return NotFound("Archive file missing on disk.");

        return PhysicalFile(
            project.FilePath,
            "application/zip",
            System.IO.Path.GetFileName(project.FilePath));
    }
}

