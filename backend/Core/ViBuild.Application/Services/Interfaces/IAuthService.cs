using ViBuild.Common.Models;

namespace ViBuild.Application.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> GoogleLoginAsync(string idToken);
}
