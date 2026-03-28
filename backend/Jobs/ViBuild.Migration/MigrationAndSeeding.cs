using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ViBuild.Infrastructure.Data;

namespace ViBuild.Migration;

public static class MigrationAndSeeding
{
    public static void Migrate(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ViBuildDbContext>();

        Console.WriteLine("Applying migrations...");
        context.Database.Migrate();
        Console.WriteLine("Migrations applied successfully.");
    }

    public static void Seed(IServiceProvider serviceProvider, string path)
    {
        Console.WriteLine("Seeding data...");

        using var context = new ViBuildDbContext(
            serviceProvider.GetRequiredService<DbContextOptions<ViBuildDbContext>>());

        var sqlFolderPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, path);

        Console.WriteLine("Seeding data from path: " + sqlFolderPath);

        if (!Directory.Exists(sqlFolderPath))
        {
            Console.WriteLine("Seed folder not found, skipping.");
            return;
        }

        var sqlFiles = Directory.GetFiles(sqlFolderPath, "*.sql").OrderBy(f => f).ToArray();

        if (sqlFiles.Length == 0)
        {
            Console.WriteLine("No seed files found.");
            return;
        }

        var connection = context.Database.GetDbConnection();
        connection.Open();

        foreach (var file in sqlFiles)
        {
            Console.WriteLine($"Executing: {Path.GetFileName(file)}");
            var sql = File.ReadAllText(file);
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.ExecuteNonQuery();
            Console.WriteLine($"Done: {Path.GetFileName(file)}");
        }

        Console.WriteLine("Seeding completed.");
    }
}
