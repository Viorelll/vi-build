using ViBuild.Common.Models;

namespace ViBuild.Application.Services.Interfaces;

public interface IProjectGenerationService
{
    Task<GenerateProjectResponseDto> GenerateAsync(GenerateProjectRequestDto request);
}
