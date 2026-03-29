using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ViBuild.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ProjectMDFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MDFiles_StepOrder",
                table: "MDFiles");

            migrationBuilder.DropColumn(
                name: "StepOrder",
                table: "MDFiles");

            migrationBuilder.CreateTable(
                name: "ProjectMDFiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    MDFileId = table.Column<int>(type: "integer", nullable: false),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectMDFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectMDFiles_MDFiles_MDFileId",
                        column: x => x.MDFileId,
                        principalTable: "MDFiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectMDFiles_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMDFiles_MDFileId",
                table: "ProjectMDFiles",
                column: "MDFileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMDFiles_ProjectId_StepOrder",
                table: "ProjectMDFiles",
                columns: new[] { "ProjectId", "StepOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectMDFiles");

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
    }
}
