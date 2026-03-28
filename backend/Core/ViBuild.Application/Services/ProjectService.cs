using Microsoft.EntityFrameworkCore;
using ViBuild.Application.Mappings;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class ProjectService : IProjectService
{
    private readonly ViBuildDbContext _context;

    public ProjectService(ViBuildDbContext context) => _context = context;

    public async Task<List<ProjectDto>> GetAllAsync() =>
        await _context.Projects.Select(p => p.ToDto()).ToListAsync();

    public async Task<List<ProjectDto>> GetByUserIdAsync(int userId) =>
        await _context.Projects.Where(p => p.UserId == userId).Select(p => p.ToDto()).ToListAsync();

    public async Task<ProjectDto?> GetByIdAsync(int id) =>
        await _context.Projects.Where(p => p.Id == id).Select(p => p.ToDto()).FirstOrDefaultAsync();

    public async Task<ProjectDto> CreateAsync(int userId, CreateProjectDto dto)
    {
        var project = dto.ToEntity(userId);
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return project.ToDto();
    }

    public async Task<ProjectDto?> UpdateAsync(int id, UpdateProjectDto dto)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is null) return null;
        dto.UpdateEntity(project);
        await _context.SaveChangesAsync();
        return project.ToDto();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is null) return false;
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }
}
