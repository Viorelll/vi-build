using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ViBuild.Domain.Entities;

namespace ViBuild.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.SiteType).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Status).HasConversion<int>();
        builder.Property(p => p.DesignFramework).HasMaxLength(100);
        builder.Property(p => p.Theme).HasMaxLength(100);
        builder.Property(p => p.FigmaLink).HasMaxLength(500);
        builder.Property(p => p.FilePath).HasMaxLength(500);
    }
}
