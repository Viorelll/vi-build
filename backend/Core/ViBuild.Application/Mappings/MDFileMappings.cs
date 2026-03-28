using ViBuild.Common.Models;
using ViBuild.Domain.Entities;
using ViBuild.Domain.Enums;

namespace ViBuild.Application.Mappings;

public static class MDFileMappings
{
    public static MDFileDto ToDto(this MDFile file) => new()
    {
        Id = file.Id,
        FileName = file.FileName,
        FileType = file.FileType?.ToString(),
        Content = file.Content,
        CreatedAt = file.CreatedAt,
        UpdatedAt = file.UpdatedAt
    };

    public static MDFile ToEntity(this CreateMDFileDto dto) => new()
    {
        FileName = dto.FileName,
        FileType = Enum.TryParse<MDFileType>(dto.FileType, true, out var ft) ? ft : null,
        Content = dto.Content
    };

    public static void UpdateEntity(this UpdateMDFileDto dto, MDFile file)
    {
        if (dto.FileName is not null) file.FileName = dto.FileName;
        if (dto.Content is not null) file.Content = dto.Content;
        if (dto.FileType is not null)
            file.FileType = Enum.TryParse<MDFileType>(dto.FileType, true, out var ft) ? ft : file.FileType;
        file.UpdatedAt = DateTime.UtcNow;
    }
}
