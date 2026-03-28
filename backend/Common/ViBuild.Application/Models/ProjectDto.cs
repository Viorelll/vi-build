namespace ViBuild.Common.Models;

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int UserId { get; set; }
    public string SiteType { get; set; } = null!;
    public string JsonInput { get; set; } = null!;
    public string? DesignFramework { get; set; }
    public string? Theme { get; set; }
    public string? FigmaLink { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? GeneratedAt { get; set; }
    public string? FilePath { get; set; }
}

public class CreateProjectDto
{
    public string Name { get; set; } = null!;
    public string SiteType { get; set; } = null!;
    public string JsonInput { get; set; } = null!;
    public string? DesignFramework { get; set; }
    public string? Theme { get; set; }
    public string? FigmaLink { get; set; }
}

public class UpdateProjectDto
{
    public string? Name { get; set; }
    public string? DesignFramework { get; set; }
    public string? Theme { get; set; }
    public string? FigmaLink { get; set; }
    public string? Status { get; set; }
    public string? FilePath { get; set; }
}
