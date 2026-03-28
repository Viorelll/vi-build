using Microsoft.EntityFrameworkCore;
using ViBuild.Application.Mappings;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class MDFileService : IMDFileService
{
    private readonly ViBuildDbContext _context;

    public MDFileService(ViBuildDbContext context) => _context = context;

    public async Task<List<MDFileDto>> GetAllAsync() =>
        await _context.MDFiles.Select(m => m.ToDto()).ToListAsync();

    public async Task<MDFileDto?> GetByIdAsync(int id) =>
        await _context.MDFiles.Where(m => m.Id == id).Select(m => m.ToDto()).FirstOrDefaultAsync();

    public async Task<MDFileDto> CreateAsync(CreateMDFileDto dto)
    {
        var file = dto.ToEntity();
        _context.MDFiles.Add(file);
        await _context.SaveChangesAsync();
        return file.ToDto();
    }

    public async Task<MDFileDto?> UpdateAsync(int id, UpdateMDFileDto dto)
    {
        var file = await _context.MDFiles.FindAsync(id);
        if (file is null) return null;
        dto.UpdateEntity(file);
        await _context.SaveChangesAsync();
        return file.ToDto();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var file = await _context.MDFiles.FindAsync(id);
        if (file is null) return false;
        _context.MDFiles.Remove(file);
        await _context.SaveChangesAsync();
        return true;
    }
}
