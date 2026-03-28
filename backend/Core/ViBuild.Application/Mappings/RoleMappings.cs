using ViBuild.Common.Models;
using ViBuild.Domain.Entities;

namespace ViBuild.Application.Mappings;

public static class RoleMappings
{
    public static RoleDto ToDto(this Role role) => new()
    {
        Id = role.Id,
        Name = role.Name
    };

    public static Role ToEntity(this CreateRoleDto dto) => new()
    {
        Name = dto.Name
    };

    public static void UpdateEntity(this UpdateRoleDto dto, Role role)
    {
        role.Name = dto.Name;
    }
}
