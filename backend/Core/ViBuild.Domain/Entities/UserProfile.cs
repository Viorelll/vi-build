namespace ViBuild.Domain.Entities;

public class UserProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
