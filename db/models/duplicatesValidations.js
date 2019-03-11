'use strict';

const sha1 = require('js-sha1');

module.exports = (sequelize, DataTypes) => {
  const DuplicatesValidations = sequelize.define('DuplicatesValidations',
                                                 {
                                                   id               : {
                                                     type      : DataTypes.STRING,
                                                     primaryKey: true,
                                                     allowNull : false,
                                                     set(value){
                                                       throw idException(value);
                                                     }
                                                   },
                                                   isDuplicate      : {type: DataTypes.BOOLEAN, allowNull: false},
                                                   initialSourceId  : {type: DataTypes.STRING, allowNull: false},
                                                   initialSource    : {type: DataTypes.STRING, allowNull: false},
                                                   initialIdConditor: DataTypes.VIRTUAL,
                                                   targetSourceId   : {type: DataTypes.STRING, allowNull: false},
                                                   targetSource     : {type: DataTypes.STRING, allowNull: false},
                                                   targetIdConditor : DataTypes.VIRTUAL,
                                                   comment          : {type: DataTypes.STRING(400)}
                                                 },
                                                 {
                                                   hooks: {
                                                     beforeValidate: (duplicatesValidation) => {
                                                       duplicatesValidation.generateId();
                                                     }
                                                   }
                                                 }
  );

  // Instance helpers
  DuplicatesValidations.prototype.generateId = function() {
    this.setDataValue('id', _generateDuplicatesPairId([this.getInitialSourceUid(), this.getTargetSourceUid()]));
  };

  DuplicatesValidations.prototype.getInitialSourceUid = function() {
    return `${this.getDataValue('initialSource')}#${this.getDataValue('initialSourceId')}`;
  };

  DuplicatesValidations.prototype.getTargetSourceUid = function() {
    return `${this.getDataValue('targetSource')}#${this.getDataValue('targetSourceId')}`;
  };

  // Model helpers
  DuplicatesValidations.associate = function({DuplicatesValidations, Users}) {
    DuplicatesValidations.belongsTo(Users, {foreignKey: {allowNull: false}});
  };

  return DuplicatesValidations;
};

function _generateDuplicatesPairId (duplicatesSourceUids) {
  return sha1(duplicatesSourceUids.sort().join(''));
}

/*
 * Exceptions
 */
function idException (value) {
  let err = new Error(`DuplicatesValidations id may only be auto generated, got ${value}`);
  err.name = 'idException';

  return err;
}
