using ViBuild.Common.Models;
using ViBuild.Domain.Entities;

namespace ViBuild.Application.Mappings;

public static class ProjectMDFileMappings
{
    public static ProjectMDFileDto ToDto(this ProjectMDFile pm) => new()
    {
        Id          = pm.Id,
        ProjectId   = pm.ProjectId,
        MDFileId    = pm.MDFileId,
        MDFileName  = pm.MDFile.FileName,
        StepOrder   = pm.StepOrder,
        IsActive    = pm.IsActive,
        CreatedAt   = pm.CreatedAt,
        UpdatedAt   = pm.UpdatedAt
    };

    public static ProjectMDFile ToEntity(this CreateProjectMDFileDto dto, int projectId) => new()
    {
        ProjectId = projectId,
        MDFileId  = dto.MDFileId,
        StepOrder = dto.StepOrder,
        IsActive  = dto.IsActive
    };

    public static void UpdateEntity(this UpdateProjectMDFileDto dto, ProjectMDFile pm)
    {
        if (dto.StepOrder is not null) pm.StepOrder = dto.StepOrder.Value;
        if (dto.IsActive  is not null) pm.IsActive  = dto.IsActive.Value;
        pm.UpdatedAt = DateTime.UtcNow;
    }
}
