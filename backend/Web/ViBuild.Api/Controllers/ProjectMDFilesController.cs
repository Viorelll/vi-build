using Microsoft.AspNetCore.Mvc;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;

namespace ViBuild.Api.Controllers;

[ApiController]
[Route("api/projects/{projectId:int}/mdfiles")]
public class ProjectMDFilesController : ControllerBase
{
    private readonly IProjectMDFileService _service;

    public ProjectMDFilesController(IProjectMDFileService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<ProjectMDFileDto>>> GetAll(int projectId) =>
        Ok(await _service.GetByProjectAsync(projectId));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectMDFileDto>> GetById(int projectId, int id)
    {
        var pm = await _service.GetByIdAsync(projectId, id);
        return pm is null ? NotFound() : Ok(pm);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectMDFileDto>> Create(
        int projectId, [FromBody] CreateProjectMDFileDto dto)
    {
        var pm = await _service.CreateAsync(projectId, dto);
        return CreatedAtAction(nameof(GetById), new { projectId, id = pm.Id }, pm);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProjectMDFileDto>> Update(
        int projectId, int id, [FromBody] UpdateProjectMDFileDto dto)
    {
        var pm = await _service.UpdateAsync(projectId, id, dto);
        return pm is null ? NotFound() : Ok(pm);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int projectId, int id) =>
        await _service.DeleteAsync(projectId, id) ? NoContent() : NotFound();
}
