"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StudentInternship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StudentInternship.belongsTo(models.User, {
        foreignKey: "studentID",
      });
      StudentInternship.belongsTo(models.Internship, {
        foreignKey: "InternshipID",
      });
    }

    static studentJoinInternship(studentID, InternshipID) {
      return StudentInternship.create({
        studentID: studentID,
        InternshipID: InternshipID,
      });
    }

    static getInternshipByStudentId(studentId) {
      return StudentInternship.findAll({
        where: { studentID: studentId },
        attributes: ['InternshipID'], // Include only the InternshipID in the result
        raw: true, // Return plain JSON objects instead of instances
      });
    }
    
    //function to check is student has joined an internship
    static async isStudentJoinedInternship(studentID, InternshipID) {
      const studentInternship = await StudentInternship.findOne({
        where: { studentID: studentID, InternshipID: InternshipID },
      });

      return !!studentInternship; // Returns true if studentInternship exists, false otherwise
    }
    //find student id by internship id
    static getStudentIdByInternshipId(internshipId) {
      return StudentInternship.findAll({
        where: { InternshipID: internshipId },
      });
    }
  }
  StudentInternship.init(
    {
      studentID: DataTypes.INTEGER,
      InternshipID: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "StudentInternship",
    }
  );
  return StudentInternship;
};
