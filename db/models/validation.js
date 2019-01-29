'use strict';
module.exports = (sequelize, DataTypes) => {
  const Validation = sequelize.define('Validation', {
    isDuplicate: DataTypes.BOOLEAN,
    idConditor: DataTypes.STRING,
    targetIdConditor: DataTypes.STRING
  }, {});
  Validation.associate = function(models) {
    // associations can be defined here
  };
  return Validation;
};