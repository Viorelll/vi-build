using ViBuild.Common.Models;

namespace ViBuild.Application.Services.Interfaces;

public interface IFeatureService
{
    Task<List<FeatureDto>> GetAllAsync();
    Task<FeatureDto?> GetByIdAsync(int id);
    Task<FeatureDto> CreateAsync(CreateFeatureDto dto);
    Task<FeatureDto?> UpdateAsync(int id, UpdateFeatureDto dto);
    Task<bool> DeleteAsync(int id);
}
