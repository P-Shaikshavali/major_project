using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EGrievanceApi.Migrations
{
    /// <inheritdoc />
    public partial class FixAssignedToPropertyRename : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AssignedTo",
                table: "Grievances",
                newName: "AssignedToRole");

            migrationBuilder.AddColumn<int>(
                name: "AssignedToUserId",
                table: "Grievances",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                table: "Grievances");

            migrationBuilder.RenameColumn(
                name: "AssignedToRole",
                table: "Grievances",
                newName: "AssignedTo");
        }
    }
}
