'use strict';
module.exports = (sequelize, DataTypes) => {
  const Validation = sequelize.define('DuplicatesValidations', {
    isDuplicate    : DataTypes.BOOLEAN,
    initialSourceId: DataTypes.STRING,
    initialSource  : DataTypes.STRING,
    targetSourceId : DataTypes.STRING,
    targetSource   : DataTypes.STRING
  }, {});
  Validation.associate = function(models) {
    // associations can be defined here
  };
  return Validation;
};
