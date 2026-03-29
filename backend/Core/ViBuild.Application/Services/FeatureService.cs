using Microsoft.EntityFrameworkCore;
using ViBuild.Application.Mappings;
using ViBuild.Application.Services.Interfaces;
using ViBuild.Common.Models;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Application.Services;

public class FeatureService : IFeatureService
{
    private readonly ViBuildDbContext _context;

    public FeatureService(ViBuildDbContext context) => _context = context;

    public async Task<List<FeatureDto>> GetAllAsync() =>
        await _context.Features.Select(f => f.ToDto()).ToListAsync();

    public async Task<FeatureDto?> GetByIdAsync(int id) =>
        await _context.Features.Where(f => f.Id == id).Select(f => f.ToDto()).FirstOrDefaultAsync();

    public async Task<FeatureDto> CreateAsync(CreateFeatureDto dto)
    {
        var feature = dto.ToEntity();
        _context.Features.Add(feature);
        await _context.SaveChangesAsync();
        return feature.ToDto();
    }

    public async Task<FeatureDto?> UpdateAsync(int id, UpdateFeatureDto dto)
    {
        var feature = await _context.Features.FindAsync(id);
        if (feature is null) return null;
        feature.ApplyUpdate(dto);
        await _context.SaveChangesAsync();
        return feature.ToDto();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var feature = await _context.Features.FindAsync(id);
        if (feature is null) return false;
        _context.Features.Remove(feature);
        await _context.SaveChangesAsync();
        return true;
    }
}
