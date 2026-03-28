using ViBuild.Common.Models;
using ViBuild.Domain.Entities;

namespace ViBuild.Application.Mappings;

public static class FeatureMappings
{
    public static FeatureDto ToDto(this Feature feature) => new()
    {
        Id = feature.Id,
        Name = feature.Name
    };

    public static Feature ToEntity(this CreateFeatureDto dto) => new()
    {
        Name = dto.Name
    };
}
