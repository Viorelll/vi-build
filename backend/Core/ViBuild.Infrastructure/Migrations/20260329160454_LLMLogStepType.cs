using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViBuild.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LLMLogStepType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StepType",
                table: "LLMLogs",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StepType",
                table: "LLMLogs");
        }
    }
}
