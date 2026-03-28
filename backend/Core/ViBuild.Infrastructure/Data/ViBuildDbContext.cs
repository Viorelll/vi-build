using Microsoft.EntityFrameworkCore;
using ViBuild.Domain.Entities;

namespace ViBuild.Infrastructure.Data;

public class ViBuildDbContext : DbContext
{
    public ViBuildDbContext(DbContextOptions<ViBuildDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<Feature> Features { get; set; } = null!;
    public DbSet<ProjectFeature> ProjectFeatures { get; set; } = null!;
    public DbSet<LLMLog> LLMLogs { get; set; } = null!;
    public DbSet<MDFile> MDFiles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ViBuildDbContext).Assembly);
    }
}
