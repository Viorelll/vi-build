namespace ViBuild.Common.Models;

public class MDFileDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateMDFileDto
{
    public string FileName { get; set; } = null!;
    public string Content { get; set; } = null!;
}

public class UpdateMDFileDto
{
    public string? FileName { get; set; }
    public string? Content { get; set; }
}
