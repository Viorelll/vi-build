using Microsoft.AspNetCore.Mvc;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;

namespace ViBuild.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeaturesController : ControllerBase
{
    private readonly IFeatureService _featureService;

    public FeaturesController(IFeatureService featureService) => _featureService = featureService;

    [HttpGet]
    public async Task<ActionResult<List<FeatureDto>>> GetAll() =>
        Ok(await _featureService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FeatureDto>> GetById(int id)
    {
        var feature = await _featureService.GetByIdAsync(id);
        return feature is null ? NotFound() : Ok(feature);
    }

    [HttpPost]
    public async Task<ActionResult<FeatureDto>> Create([FromBody] CreateFeatureDto dto)
    {
        var feature = await _featureService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = feature.Id }, feature);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _featureService.DeleteAsync(id) ? NoContent() : NotFound();
}
