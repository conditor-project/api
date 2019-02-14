'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('Users', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    role: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
