"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.StudentInternship, {
        foreignKey: "studentID",
      });
    }

    //create a function that takes id and 
    static async getUserById(id) {
      // return only the email
      return User.findByPk(id, {
        attributes: ["Email"],
      });
    }


    static async getUserByEmail(email) {
      return User.findOne({ where: { Email: email } });
    }

    // static createUser(firstName, lastName, email, password, isAdmin) {
    //   return User.create({
    //     FirstName: firstName,
    //     LastName: lastName,
    //     Email: email,
    //     Password: password,
    //     isAdmin: false,
    //   });
    // }

    static createUser(firstName, lastName, email, password, isAdmin) {
      const hashedPassword = bcrypt.hashSync(password, 10);

      return User.create({
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Password: hashedPassword,
        isAdmin: false,
      });
    }

    validatePassword(password) {
      return bcrypt.compareSync(password, this.Password);
    }

  }
  User.init(
    {
      FirstName: DataTypes.STRING,
      LastName: DataTypes.STRING,
      Email: DataTypes.STRING,
      Password: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
