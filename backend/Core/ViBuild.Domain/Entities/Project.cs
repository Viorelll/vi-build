
using ViBuild.Domain.Enums;

namespace ViBuild.Domain.Entities;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int UserId { get; set; }
    public string SiteType { get; set; } = null!;
    public string JsonInput { get; set; } = null!;
    public string? DesignFramework { get; set; }
    public string? Theme { get; set; }
    public string? FigmaLink { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Pending;
    public DateTime? GeneratedAt { get; set; }
    public string? FilePath { get; set; }
    public string? ApiJson { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<ProjectFeature> ProjectFeatures { get; set; } = new List<ProjectFeature>();
    public ICollection<LLMLog> LLMLogs { get; set; } = new List<LLMLog>();
    public ICollection<ProjectMDFile> ProjectMDFiles { get; set; } = new List<ProjectMDFile>();
}

