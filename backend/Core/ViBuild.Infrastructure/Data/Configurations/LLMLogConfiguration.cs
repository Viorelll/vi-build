using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ViBuild.Domain.Entities;

namespace ViBuild.Infrastructure.Data.Configurations;

public class LLMLogConfiguration : IEntityTypeConfiguration<LLMLog>
{
    public void Configure(EntityTypeBuilder<LLMLog> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Status).HasConversion<int>();

        builder.HasOne(l => l.Project)
            .WithMany(p => p.LLMLogs)
            .HasForeignKey(l => l.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
