namespace ViBuild.Domain.Entities;
public class Feature
{
    public int Id { get; set; }
    public string Name { get; set; } = null!; // ex: shopping_cart, user_login

    public ICollection<ProjectFeature> ProjectFeatures { get; set; } = new List<ProjectFeature>();
}
