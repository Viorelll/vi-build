using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ViBuild.Domain.Entities;

namespace ViBuild.Infrastructure.Data.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.FullName).HasMaxLength(200);
        builder.Property(p => p.Phone).HasMaxLength(50);
        builder.Property(p => p.AvatarUrl).HasMaxLength(500);
    }
}
