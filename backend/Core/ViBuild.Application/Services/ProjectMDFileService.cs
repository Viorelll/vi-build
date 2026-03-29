using Microsoft.EntityFrameworkCore;
using ViBuild.Application.Mappings;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class ProjectMDFileService : IProjectMDFileService
{
    private readonly ViBuildDbContext _context;

    public ProjectMDFileService(ViBuildDbContext context) => _context = context;

    public async Task<List<ProjectMDFileDto>> GetByProjectAsync(int projectId) =>
        await _context.ProjectMDFiles
            .Where(pm => pm.ProjectId == projectId)
            .OrderBy(pm => pm.StepOrder)
            .Include(pm => pm.MDFile)
            .Select(pm => pm.ToDto())
            .ToListAsync();

    public async Task<ProjectMDFileDto?> GetByIdAsync(int projectId, int id) =>
        await _context.ProjectMDFiles
            .Where(pm => pm.ProjectId == projectId && pm.Id == id)
            .Include(pm => pm.MDFile)
            .Select(pm => pm.ToDto())
            .FirstOrDefaultAsync();

    public async Task<ProjectMDFileDto> CreateAsync(int projectId, CreateProjectMDFileDto dto)
    {
        var pm = dto.ToEntity(projectId);
        _context.ProjectMDFiles.Add(pm);
        await _context.SaveChangesAsync();

        await _context.Entry(pm).Reference(p => p.MDFile).LoadAsync();
        return pm.ToDto();
    }

    public async Task<ProjectMDFileDto?> UpdateAsync(int projectId, int id, UpdateProjectMDFileDto dto)
    {
        var pm = await _context.ProjectMDFiles
            .Include(p => p.MDFile)
            .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.Id == id);

        if (pm is null) return null;

        dto.UpdateEntity(pm);
        await _context.SaveChangesAsync();
        return pm.ToDto();
    }

    public async Task<bool> DeleteAsync(int projectId, int id)
    {
        var pm = await _context.ProjectMDFiles
            .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.Id == id);

        if (pm is null) return false;

        _context.ProjectMDFiles.Remove(pm);
        await _context.SaveChangesAsync();
        return true;
    }
}
