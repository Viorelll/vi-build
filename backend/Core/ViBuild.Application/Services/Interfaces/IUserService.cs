using ViBuild.Common.Models;

namespace ViBuild.Application.Services.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> UpdateProfileAsync(int userId, UpdateUserProfileDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> AssignRoleAsync(int userId, int roleId);
    Task<bool> RemoveRoleAsync(int userId, int roleId);
}
