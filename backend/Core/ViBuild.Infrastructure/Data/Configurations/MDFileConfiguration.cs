using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ViBuild.Domain.Entities;

namespace ViBuild.Infrastructure.Data.Configurations;

public class MDFileConfiguration : IEntityTypeConfiguration<MDFile>
{
    public void Configure(EntityTypeBuilder<MDFile> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.FileName).IsRequired().HasMaxLength(300);
        builder.Property(m => m.FileType).HasConversion<int?>();
    }
}
