using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViBuild.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ProjectApiJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApiJson",
                table: "Projects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApiJson",
                table: "Projects");
        }
    }
}
