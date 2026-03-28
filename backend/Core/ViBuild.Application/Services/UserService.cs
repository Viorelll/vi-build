using Microsoft.EntityFrameworkCore;
using ViBuild.Application.Mappings;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Domain.Entities;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class UserService : IUserService
{
    private readonly ViBuildDbContext _context;

    public UserService(ViBuildDbContext context) => _context = context;

    public async Task<List<UserDto>> GetAllAsync() =>
        await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Select(u => u.ToDto())
            .ToListAsync();

    public async Task<UserDto?> GetByIdAsync(int id) =>
        await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.Id == id)
            .Select(u => u.ToDto())
            .FirstOrDefaultAsync();

    public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateUserProfileDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null) return null;

        if (user.Profile is null)
        {
            user.Profile = new UserProfile { UserId = userId };
            _context.UserProfiles.Add(user.Profile);
        }

        dto.UpdateEntity(user.Profile);
        await _context.SaveChangesAsync();
        return user.ToDto();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null) return false;
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignRoleAsync(int userId, int roleId)
    {
        var exists = await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
        if (exists) return false;
        _context.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveRoleAsync(int userId, int roleId)
    {
        var userRole = await _context.UserRoles.FindAsync(userId, roleId);
        if (userRole is null) return false;
        _context.UserRoles.Remove(userRole);
        await _context.SaveChangesAsync();
        return true;
    }
}
