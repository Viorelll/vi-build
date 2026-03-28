using ViBuild.Domain.Enums;

namespace ViBuild.Domain.Entities;
public class MDFile
{
    public int Id { get; set; }
    public string FileName { get; set; } = null!;
    public MDFileType? FileType { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}