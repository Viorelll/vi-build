namespace ViBuild.Domain.Entities;

public class ProjectMDFile
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int MDFileId { get; set; }
    public int StepOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public Project Project { get; set; } = null!;
    public MDFile MDFile { get; set; } = null!;
}
