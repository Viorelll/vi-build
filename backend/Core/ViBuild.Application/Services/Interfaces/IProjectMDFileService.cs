using ViBuild.Common.Models;

namespace ViBuild.Application.Services.Interfaces;

public interface IProjectMDFileService
{
    Task<List<ProjectMDFileDto>> GetByProjectAsync(int projectId);
    Task<ProjectMDFileDto?> GetByIdAsync(int projectId, int id);
    Task<ProjectMDFileDto> CreateAsync(int projectId, CreateProjectMDFileDto dto);
    Task<ProjectMDFileDto?> UpdateAsync(int projectId, int id, UpdateProjectMDFileDto dto);
    Task<bool> DeleteAsync(int projectId, int id);
}
