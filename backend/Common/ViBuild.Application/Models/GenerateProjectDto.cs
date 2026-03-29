namespace ViBuild.Common.Models;

public class GenerateProjectRequestDto
{
    public int UserId { get; set; }
    public string ProjectName { get; set; } = null!;
    public string SiteType { get; set; } = null!;
    public string? DesignFramework { get; set; }
    public string? Theme { get; set; }
    public string? FigmaLink { get; set; }
    public string? Description { get; set; }
    public List<int> Features { get; set; } = [];
    public List<int> MdFileIds { get; set; } = [];
}

public class GenerateProjectResponseDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public string ArchivePath { get; set; } = null!;
    public string Status { get; set; } = null!;
}
