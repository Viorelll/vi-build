using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViBuild.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MDFileStepOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StepOrder",
                table: "MDFiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_MDFiles_StepOrder",
                table: "MDFiles",
                column: "StepOrder");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MDFiles_StepOrder",
                table: "MDFiles");

            migrationBuilder.DropColumn(
                name: "StepOrder",
                table: "MDFiles");
        }
    }
}
