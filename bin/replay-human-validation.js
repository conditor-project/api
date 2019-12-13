#!/usr/bin/env node
'use strict';
const models = require('../db/models');
const esConf = require('co-config/es.js');
const { main: esClient } = require('../helpers/clients/elastic').startAll().get();
const _ = require('lodash');
const Promise = require('bluebird');
const { updateDuplicatesTree } = require('../src/managers/duplicatesManager.js');

if (process.argv[1] === __filename) {
  replayHumanValidation()
    .then(() => console.log('replayHumanValidation script finished !'))
    .catch(console.error);
}

module.exports = replayHumanValidation;

function replayHumanValidation () {
  return models.DuplicatesValidations.findAll()
    .map(duplicatesValidation => duplicatesValidation.dataValues)
    .then(duplicatesValidations => {
      const groupDuplicatesValidations = _.groupBy(duplicatesValidations, (item) => `${item.initialSource}-${item.initialSourceId}`);
      const groupKeys = Object.keys(groupDuplicatesValidations);
      return Promise.each(groupKeys, key => {
        const duplicatesValidations = groupDuplicatesValidations[key];
        return Promise.join(
          // get initialRecord
          getRecord(duplicatesValidations[0].initialSource, duplicatesValidations[0].initialSourceId),
          // get reportDuplicates
          Promise.filter(duplicatesValidations, duplicateValidation => duplicateValidation.isDuplicate)
            .map(duplicateValidation => getRecord(duplicateValidation.targetSource, duplicateValidation.targetSourceId)),
          // get reportNonDuplicates
          Promise.filter(duplicatesValidations, duplicateValidation => !duplicateValidation.isDuplicate)
            .map(duplicateValidation => getRecord(duplicateValidation.targetSource, duplicateValidation.targetSourceId)),
          function (initialRecord, reportDuplicates, reportNonDuplicates) {
            return updateDuplicatesTree(initialRecord, { reportDuplicates, reportNonDuplicates }, { index: esConf.index });
          }
        );
      });
    });
}

function getRecord (source, sourceId) {
  return esClient.search({
    index: esConf.index,
    q: `source:${source} AND sourceId:${sourceId}`
  }).then(result => result.hits.hits.pop()._source);
}
