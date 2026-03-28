namespace ViBuild.Common.Models;

public class GoogleLoginDto
{
    public string IdToken { get; set; }
}

public class AuthResponseDto
{
    public int UserId { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public List<string> Roles { get; set; } = [];
}
