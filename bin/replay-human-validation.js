#!/usr/bin/env node
'use strict';
const models = require('../db/models');
const _ = require('lodash');

if (process.argv[1] === __filename) {
  replayHumanValidation()
    .then(() => console.log('replayHumanValidation script finished !'))
    .catch(console.error);
}

module.exports = replayHumanValidation;

function replayHumanValidation () {
  return models.sequelize.sync()
    .then(() => models.DuplicatesValidations.findAll())
    .map(duplicatesValidation => duplicatesValidation.dataValues)
    .then(duplicatesValidations => {
      const groupDuplicatesValidations = _.groupBy(duplicatesValidations, (item) => `${item.initialSource}-${item.initialSourceId}`);
      for (const key in groupDuplicatesValidations) {
        console.log(`${key}: ${groupDuplicatesValidations[key].length}`);
      }
    });
}
