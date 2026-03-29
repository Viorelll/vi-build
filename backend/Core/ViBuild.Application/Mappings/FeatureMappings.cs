using ViBuild.Common.Models;
using ViBuild.Domain.Entities;

namespace ViBuild.Application.Mappings;

public static class FeatureMappings
{
    public static FeatureDto ToDto(this Feature feature) => new()
    {
        Id = feature.Id,
        Name = feature.Name,
        Description = feature.Description
    };

    public static Feature ToEntity(this CreateFeatureDto dto) => new()
    {
        Name = dto.Name,
        Description = dto.Description
    };

    public static void ApplyUpdate(this Feature feature, UpdateFeatureDto dto)
    {
        feature.Name = dto.Name;
        feature.Description = dto.Description;
    }
}
