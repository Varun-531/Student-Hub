"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Internship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Internship.hasMany(models.StudentInternship, {
        foreignKey: "InternshipID",
      });
    }

    static getAllInternships() {
      return Internship.findAll();
    }

    static getInternshipByStudentId(studentId) {
      return Internship.findAll({
        include: {
          model: StudentInternship,
          where: {
            studentID: studentId,
          },
        },
      });
    }

    static uploadInternship(title, description, startDate, endDate, location) {
      return Internship.create({
        Title: title,
        Description: description,
        StartDate: startDate,
        EndDate: endDate,
        Location: location,
      });
    }
  }
  Internship.init(
    {
      Title: DataTypes.STRING,
      Description: DataTypes.STRING,
      StartDate: DataTypes.DATE,
      EndDate: DataTypes.DATE,
      Location: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Internship",
    }
  );
  return Internship;
};
