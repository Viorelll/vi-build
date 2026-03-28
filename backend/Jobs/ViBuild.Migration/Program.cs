using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ViBuild.Infrastructure.Data;
using ViBuild.Migration;


var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables()
    .Build();

var serviceProvider = new ServiceCollection()
    .AddDbContext<ViBuildDbContext>(options =>
        options.UseNpgsql(configuration.GetConnectionString("ViBuild"),
            m => m.MigrationsAssembly("ViBuild.Infrastructure")
        ))
    .BuildServiceProvider();

if (configuration["ConnectionStrings:Migrate"] != "false")
{
    if (configuration["ConnectionStrings:ViBuild"] == null) throw new Exception("ConnectionStrings:ViBuild is not defined in appsettings.json");
    MigrationAndSeeding.Migrate(serviceProvider);
}

if (configuration["Seeding:SeedData"] != "false")
{
    if (configuration["Seeding:SeedDataPath"] == null) throw new Exception("Seeding:SeedDataPath is not defined in appsettings.json");
    MigrationAndSeeding.Seed(serviceProvider, configuration["Seeding:SeedDataPath"]!);
}
