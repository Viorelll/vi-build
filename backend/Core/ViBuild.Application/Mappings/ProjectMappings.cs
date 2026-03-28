using ViBuild.Common.Models;
using ViBuild.Domain.Entities;
using ViBuild.Domain.Enums;

namespace ViBuild.Application.Mappings;

public static class ProjectMappings
{
    public static ProjectDto ToDto(this Project project) => new()
    {
        Id = project.Id,
        Name = project.Name,
        UserId = project.UserId,
        SiteType = project.SiteType,
        JsonInput = project.JsonInput,
        DesignFramework = project.DesignFramework,
        Theme = project.Theme,
        FigmaLink = project.FigmaLink,
        Status = project.Status.ToString(),
        GeneratedAt = project.GeneratedAt,
        FilePath = project.FilePath
    };

    public static Project ToEntity(this CreateProjectDto dto, int userId) => new()
    {
        Name = dto.Name,
        UserId = userId,
        SiteType = dto.SiteType,
        JsonInput = dto.JsonInput,
        DesignFramework = dto.DesignFramework,
        Theme = dto.Theme,
        FigmaLink = dto.FigmaLink
    };

    public static void UpdateEntity(this UpdateProjectDto dto, Project project)
    {
        if (dto.Name is not null) project.Name = dto.Name;
        if (dto.DesignFramework is not null) project.DesignFramework = dto.DesignFramework;
        if (dto.Theme is not null) project.Theme = dto.Theme;
        if (dto.FigmaLink is not null) project.FigmaLink = dto.FigmaLink;
        if (dto.Status is not null && Enum.TryParse<ProjectStatus>(dto.Status, true, out var status))
            project.Status = status;
        if (dto.FilePath is not null) project.FilePath = dto.FilePath;
    }
}
