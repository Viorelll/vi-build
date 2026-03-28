using Microsoft.AspNetCore.Mvc;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;

namespace ViBuild.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService) => _userService = userService;

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll() =>
        Ok(await _userService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPut("{id:int}/profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile(int id, [FromBody] UpdateUserProfileDto dto)
    {
        var user = await _userService.UpdateProfileAsync(id, dto);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _userService.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("{id:int}/roles/{roleId:int}")]
    public async Task<IActionResult> AssignRole(int id, int roleId) =>
        await _userService.AssignRoleAsync(id, roleId) ? NoContent() : Conflict("Role already assigned.");

    [HttpDelete("{id:int}/roles/{roleId:int}")]
    public async Task<IActionResult> RemoveRole(int id, int roleId) =>
        await _userService.RemoveRoleAsync(id, roleId) ? NoContent() : NotFound();
}
