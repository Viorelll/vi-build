using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ViBuild.Domain.Entities;

namespace ViBuild.Infrastructure.Data.Configurations;

public class ProjectMDFileConfiguration : IEntityTypeConfiguration<ProjectMDFile>
{
    public void Configure(EntityTypeBuilder<ProjectMDFile> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.StepOrder).IsRequired();
        builder.Property(p => p.IsActive).IsRequired();

        builder.HasIndex(p => new { p.ProjectId, p.StepOrder });

        builder.HasOne(p => p.Project)
            .WithMany(p => p.ProjectMDFiles)
            .HasForeignKey(p => p.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.MDFile)
            .WithMany(m => m.ProjectMDFiles)
            .HasForeignKey(p => p.MDFileId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
