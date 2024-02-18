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
    //function to check is student has joined an internship
    static async isStudentJoinedInternship(studentID, InternshipID) {
      const studentInternship = await StudentInternship.findOne({
        where: { studentID: studentID, InternshipID: InternshipID },
      });

      return !!studentInternship; // Returns true if studentInternship exists, false otherwise
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
