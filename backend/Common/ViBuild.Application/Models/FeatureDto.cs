namespace ViBuild.Common.Models;

public class FeatureDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}

public class CreateFeatureDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}

public class UpdateFeatureDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
