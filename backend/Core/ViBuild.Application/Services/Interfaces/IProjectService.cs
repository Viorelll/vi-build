using ViBuild.Common.Models;

namespace ViBuild.Application.Services.Interfaces;

public interface IProjectService
{
    Task<List<ProjectDto>> GetAllAsync();
    Task<List<ProjectDto>> GetByUserIdAsync(int userId);
    Task<ProjectDto?> GetByIdAsync(int id);
    Task<ProjectDto> CreateAsync(int userId, CreateProjectDto dto);
    Task<ProjectDto?> UpdateAsync(int id, UpdateProjectDto dto);
    Task<bool> DeleteAsync(int id);
}
