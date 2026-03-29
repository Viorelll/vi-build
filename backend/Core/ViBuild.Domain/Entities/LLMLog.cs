using ViBuild.Domain.Enums;

namespace ViBuild.Domain.Entities;
public class LLMLog
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public MDFileType? StepType { get; set; }
    public string? Prompt { get; set; }
    public string? Response { get; set; }
    public int TokensUsed { get; set; }
    public LLMLogStatus Status { get; set; } = LLMLogStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Project Project { get; set; } = null!;
}
