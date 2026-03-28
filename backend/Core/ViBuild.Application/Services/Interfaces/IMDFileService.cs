using ViBuild.Common.Models;

namespace ViBuild.Application.Services.Interfaces;

public interface IMDFileService
{
    Task<List<MDFileDto>> GetAllAsync();
    Task<MDFileDto?> GetByIdAsync(int id);
    Task<MDFileDto> CreateAsync(CreateMDFileDto dto);
    Task<MDFileDto?> UpdateAsync(int id, UpdateMDFileDto dto);
    Task<bool> DeleteAsync(int id);
}
