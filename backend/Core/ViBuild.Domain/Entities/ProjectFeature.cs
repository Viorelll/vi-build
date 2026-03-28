namespace ViBuild.Domain.Entities;
public class ProjectFeature
{
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public int FeatureId { get; set; }
    public Feature Feature { get; set; } = null!;
}
