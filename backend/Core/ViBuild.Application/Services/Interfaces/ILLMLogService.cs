using ViBuild.Common.Models;

namespace ViBuild.Application.Services.Interfaces;

public interface ILLMLogService
{
    Task<List<LLMLogDto>> GetByProjectIdAsync(int projectId);
    Task<LLMLogDto?> GetByIdAsync(int id);
}
