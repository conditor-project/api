'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    email: {type:DataTypes.STRING,validate:{isEmail:true}, allowNull:false, unique: true}
  }, {});
  Users.associate = function(models) {
    // associations can be defined here
  };
  return Users;
};
