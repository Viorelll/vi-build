using Microsoft.EntityFrameworkCore;
using ViBuild.Application.Mappings;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class LLMLogService : ILLMLogService
{
    private readonly ViBuildDbContext _context;

    public LLMLogService(ViBuildDbContext context) => _context = context;

    public async Task<List<LLMLogDto>> GetByProjectIdAsync(int projectId) =>
        await _context.LLMLogs
            .Where(l => l.ProjectId == projectId)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => l.ToDto())
            .ToListAsync();

    public async Task<LLMLogDto?> GetByIdAsync(int id) =>
        await _context.LLMLogs.Where(l => l.Id == id).Select(l => l.ToDto()).FirstOrDefaultAsync();
}
