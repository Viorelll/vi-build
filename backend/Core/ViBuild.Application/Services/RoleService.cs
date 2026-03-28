using Microsoft.EntityFrameworkCore;
using ViBuild.Application.Mappings;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class RoleService : IRoleService
{
    private readonly ViBuildDbContext _context;

    public RoleService(ViBuildDbContext context) => _context = context;

    public async Task<List<RoleDto>> GetAllAsync() =>
        await _context.Roles.Select(r => r.ToDto()).ToListAsync();

    public async Task<RoleDto?> GetByIdAsync(int id) =>
        await _context.Roles.Where(r => r.Id == id).Select(r => r.ToDto()).FirstOrDefaultAsync();

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
    {
        var role = dto.ToEntity();
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        return role.ToDto();
    }

    public async Task<RoleDto?> UpdateAsync(int id, UpdateRoleDto dto)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role is null) return null;
        dto.UpdateEntity(role);
        await _context.SaveChangesAsync();
        return role.ToDto();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role is null) return false;
        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return true;
    }
}
