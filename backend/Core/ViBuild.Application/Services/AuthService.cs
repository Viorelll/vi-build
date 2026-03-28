using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Domain.Entities;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class AuthService : IAuthService
{
    private readonly ViBuildDbContext _context;

    public AuthService(ViBuildDbContext context)
    {
        _context = context;
    }

    public async Task<AuthResponseDto?> GoogleLoginAsync(string idToken)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(idToken);
        }
        catch
        {
            return null;
        }

        var email = payload.Email;

        var user = await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
        {
            user = new User
            {
                Email = email,
                CreatedAt = DateTime.UtcNow,
                Profile = new UserProfile
                {
                    FullName = payload.Name ?? email,
                    AvatarUrl = payload.Picture
                }
            };

            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            if (userRole is not null)
            {
                user.UserRoles = [new UserRole { RoleId = userRole.Id }];
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            user = await _context.Users
                .Include(u => u.Profile)
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstAsync(u => u.Id == user.Id);
        }

        return new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.Profile?.FullName ?? user.Email,
            Roles = user.UserRoles?.Select(ur => ur.Role?.Name ?? string.Empty).ToList() ?? []
        };
    }
}
