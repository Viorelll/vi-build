namespace ViBuild.Common.Models;

public class LLMLogDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string? StepType { get; set; }
    public string? Prompt { get; set; }
    public string? Response { get; set; }
    public int TokensUsed { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
