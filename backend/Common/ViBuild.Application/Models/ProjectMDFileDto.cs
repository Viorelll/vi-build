namespace ViBuild.Common.Models;

public class ProjectMDFileDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int MDFileId { get; set; }
    public string MDFileName { get; set; } = null!;
    public int StepOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateProjectMDFileDto
{
    public int MDFileId { get; set; }
    public int StepOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProjectMDFileDto
{
    public int? StepOrder { get; set; }
    public bool? IsActive { get; set; }
}
