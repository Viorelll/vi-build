using Microsoft.EntityFrameworkCore;
using ViBuild.Domain.Entities;

namespace ViBuild.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ViBuildDbContext context)
    {
        if (!await context.Roles.AnyAsync())
        {
            context.Roles.AddRange(
                new Role { Name = "Admin" },
                new Role { Name = "User" }
            );
            await context.SaveChangesAsync();
        }

        const string adminEmail = "llleroiv@gmail.com";
        if (!await context.Users.AnyAsync(u => u.Email == adminEmail))
        {
            var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");

            var user = new User
            {
                Email = adminEmail,
                CreatedAt = DateTime.UtcNow,
                Profile = new UserProfile { FullName = "Admin" },
                UserRoles = [new UserRole { RoleId = adminRole.Id }]
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();
        }
    }
}
