"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // Add foreign keys to StudentInternship
    await queryInterface.addConstraint("StudentInternships", {
      fields: ["studentID"],
      type: "foreign key",
      name: "studentID",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("StudentInternships", {
      fields: ["InternshipID"],
      type: "foreign key",
      name: "InternshipID",
      references: {
        table: "Internships",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint("StudentInternships", "studentID");
    await queryInterface.removeConstraint("StudentInternships", "InternshipID");
  },
};
