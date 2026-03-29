using ViBuild.Common.Models;
using ViBuild.Domain.Entities;

namespace ViBuild.Application.Mappings;

public static class LLMLogMappings
{
    public static LLMLogDto ToDto(this LLMLog log) => new()
    {
        Id         = log.Id,
        ProjectId  = log.ProjectId,
        StepType   = log.StepType?.ToString(),
        Prompt     = log.Prompt,
        Response   = log.Response,
        TokensUsed = log.TokensUsed,
        Status     = log.Status.ToString(),
        CreatedAt  = log.CreatedAt
    };
}
