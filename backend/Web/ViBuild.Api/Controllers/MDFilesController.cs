using Microsoft.AspNetCore.Mvc;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;

namespace ViBuild.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MDFilesController : ControllerBase
{
    private readonly IMDFileService _mdFileService;

    public MDFilesController(IMDFileService mdFileService) => _mdFileService = mdFileService;

    [HttpGet]
    public async Task<ActionResult<List<MDFileDto>>> GetAll() =>
        Ok(await _mdFileService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MDFileDto>> GetById(int id)
    {
        var file = await _mdFileService.GetByIdAsync(id);
        return file is null ? NotFound() : Ok(file);
    }

    [HttpPost]
    public async Task<ActionResult<MDFileDto>> Create([FromBody] CreateMDFileDto dto)
    {
        var file = await _mdFileService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = file.Id }, file);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<MDFileDto>> Update(int id, [FromBody] UpdateMDFileDto dto)
    {
        var file = await _mdFileService.UpdateAsync(id, dto);
        return file is null ? NotFound() : Ok(file);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _mdFileService.DeleteAsync(id) ? NoContent() : NotFound();
}
