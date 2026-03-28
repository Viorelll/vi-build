using Microsoft.AspNetCore.Mvc;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;

namespace ViBuild.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService) => _roleService = roleService;

    [HttpGet]
    public async Task<ActionResult<List<RoleDto>>> GetAll() =>
        Ok(await _roleService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoleDto>> GetById(int id)
    {
        var role = await _roleService.GetByIdAsync(id);
        return role is null ? NotFound() : Ok(role);
    }

    [HttpPost]
    public async Task<ActionResult<RoleDto>> Create([FromBody] CreateRoleDto dto)
    {
        var role = await _roleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = role.Id }, role);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<RoleDto>> Update(int id, [FromBody] UpdateRoleDto dto)
    {
        var role = await _roleService.UpdateAsync(id, dto);
        return role is null ? NotFound() : Ok(role);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _roleService.DeleteAsync(id) ? NoContent() : NotFound();
}
