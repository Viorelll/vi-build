using Microsoft.AspNetCore.Mvc;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;

namespace ViBuild.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LLMLogsController : ControllerBase
{
    private readonly ILLMLogService _llmLogService;

    public LLMLogsController(ILLMLogService llmLogService) => _llmLogService = llmLogService;

    [HttpGet("project/{projectId:int}")]
    public async Task<ActionResult<List<LLMLogDto>>> GetByProject(int projectId) =>
        Ok(await _llmLogService.GetByProjectIdAsync(projectId));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LLMLogDto>> GetById(int id)
    {
        var log = await _llmLogService.GetByIdAsync(id);
        return log is null ? NotFound() : Ok(log);
    }
}
