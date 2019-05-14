'use strict';


const recordsRepository = module.exports = {};

const _ = require('lodash')
;

recordsRepository.buildUpdateTeiBody = function(docObjects) {
  return _(docObjects)
    .compact()
    .transform(
      (accu, docObject) => {
        accu.push({update: {_id: docObject.idElasticsearch}});
        accu.push({doc: {teiBlob: docObject.teiBlob}});
      },
      []
    )
    .value()
    ;
};

recordsRepository.buildIndexBody = function(docObjects) {
  return _(docObjects)
    .compact()
    .transform(
      (accu, docObject) => {
        const indexPayload = {};
        if (_.has(docObject, 'idElasticsearch')) {
          indexPayload._id = docObject.idElasticsearch;
        }
        accu.push({index: indexPayload});
        accu.push(docObject);
      },
      []
    )
    .value()
    ;
};

recordsRepository.buildDeleteBody = function(docObjects) {
  return _(docObjects)
    .compact()
    .transform(
      (accu, docObject) => {
        accu.push({delete: {_id: docObject.idElasticsearch}});
      },
      []
    )
    .value()
    ;
};

