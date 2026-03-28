using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViBuild.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ProjectStatusToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Projects"
                ALTER COLUMN "Status" TYPE integer
                USING CASE "Status"
                    WHEN 'pending'    THEN 0
                    WHEN 'generating' THEN 1
                    WHEN 'generated'  THEN 2
                    WHEN 'failed'     THEN 3
                    ELSE 0
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Projects",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
