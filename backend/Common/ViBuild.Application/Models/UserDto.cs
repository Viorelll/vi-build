namespace ViBuild.Common.Models;

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public UserProfileDto? Profile { get; set; }
    public List<string> Roles { get; set; } = [];
}

public class UserProfileDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
}

public class CreateUserDto
{
    public string Email { get; set; } = null!;
}

public class UpdateUserDto
{
    public string Email { get; set; } = null!;
}

public class UpdateUserProfileDto
{
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
}
