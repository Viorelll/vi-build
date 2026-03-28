namespace ViBuild.Common.Models;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}

public class CreateRoleDto
{
    public string Name { get; set; } = null!;
}

public class UpdateRoleDto
{
    public string Name { get; set; } = null!;
}
