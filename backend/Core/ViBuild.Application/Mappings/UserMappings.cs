using ViBuild.Common.Models;
using ViBuild.Domain.Entities;

namespace ViBuild.Application.Mappings;

public static class UserMappings
{
    public static UserDto ToDto(this User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        CreatedAt = user.CreatedAt,
        Profile = user.Profile?.ToDto(),
        Roles = user.UserRoles?.Select(ur => ur.Role?.Name ?? string.Empty).ToList() ?? []
    };

    public static User ToEntity(this CreateUserDto dto) => new()
    {
        Email = dto.Email,
        CreatedAt = DateTime.UtcNow
    };

    public static void UpdateEntity(this UpdateUserDto dto, User user)
    {
        user.Email = dto.Email;
    }

    public static UserProfileDto ToDto(this UserProfile profile) => new()
    {
        Id = profile.Id,
        UserId = profile.UserId,
        FullName = profile.FullName,
        Bio = profile.Bio,
        AvatarUrl = profile.AvatarUrl,
        Phone = profile.Phone
    };

    public static void UpdateEntity(this UpdateUserProfileDto dto, UserProfile profile)
    {
        profile.FullName = dto.FullName;
        profile.Bio = dto.Bio;
        profile.AvatarUrl = dto.AvatarUrl;
        profile.Phone = dto.Phone;
    }
}
