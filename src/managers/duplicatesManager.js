/* jshint -W079*/
'use strict';

const
  {main: esClient} = require('../../helpers/clients/elastic').startAll().get(),
  {indices}        = require('config-component').get(module),
  _                = require('lodash'),
  fs               = require('fs-extra'),
  path             = require('path'),
  Promise          = require('bluebird'),
  {logError} = require('../../helpers/logger')
;

const duplicatesManager = module.exports;
const validateDuplicate = fs.readFileSync(path.join(__dirname, '../painless/validateDuplicates'), 'utf8');
const
  defaultParams = {
    index     : indices.records.index,
    type      : indices.records.type,
    filterPath: ['hits.hits',
                 'hits.hits._source',
                 'hits.hits._score',
                 'hits.hits.sort',
                 'hits.total',
                 '_scroll_id',
                 'aggregations']
  }
;

duplicatesManager.updateDuplicatesTree = updateDuplicatesTree;

function updateDuplicatesTree (initialRecord, {reportDuplicates = [], reportNonDuplicates = []} = {}, {index} = {}) {
  const duplicatesChain =
          _([initialRecord])
            .concat(
              _.get(initialRecord, 'duplicates', []),
              _.map(reportDuplicates, (reportDuplicate) => _.set(reportDuplicate, 'isValidatedByUser', true)),
              _.flatMap(reportDuplicates, 'duplicates')
            )
            .compact()
            .uniq()
            .map(_toNestedDuplicate)
            .value()
  ;


  const nonDuplicates =
          _(reportNonDuplicates)
            .concat(
              _.flatMap(reportNonDuplicates, 'duplicates')
            )
            .value()
  ;

  return Promise.all([
                       _buildDuplicatesUpdateByQuery(duplicatesChain, nonDuplicates, {index}),
                       _buildNonDuplicatesUpdateByQuery(duplicatesChain, nonDuplicates, {index})
                     ].map((promise) => Promise.resolve(promise).reflect())
                )
                .then((inspections) => {
                  if (_.some(inspections, (inspection) => inspection.isRejected())) {
                    throw updateDuplicatesTreeException(inspections);
                  }
                  return inspections
                    .map((inspection) => inspection.value())
                    .reduce(
                      (accu, response) => {
                        accu.updated = _.toSafeInteger(accu.updated) + _.get(response,'updated',0);
                        return accu;
                      },
                      {}
                    );
                });
}

function updateDuplicatesTreeException (inspections) {
  let err = new Error('updateDuplicatesTreeException');
  err.name = 'updateDuplicatesTreeException';
  err.status = 500;
  err.statusName = 'Internal server error';
  err.inspections = inspections.map((inspection)=>inspection._settledValueField);
  err.details = `Update process failed`;
  return err;
}

function _buildDuplicatesUpdateByQuery (duplicatesChain, nonDuplicates, {index, ...options} = {}) {
  const idConditors = _.map(duplicatesChain, 'idConditor');
  const q = `idConditor:(${idConditors.join(' OR ')})`;
  const duplicatesIdChain = _.chain(duplicatesChain)
                             .map(({source, idConditor}) => `${source}:${idConditor}`)
                             .sort()
                             .join('!')
                             .value()
  ;
  const painlessParams = {
    duplicatesChain,
    nonDuplicates,
    duplicatesIdChain: duplicatesIdChain.length ? `!${duplicatesIdChain}!` : null
  };

  const params =
          _.defaultsDeep(
            {
              q,
              index,
              body      : {
                script: {
                  lang  : 'painless',
                  inline: validateDuplicate,
                  params: painlessParams
                }
              },
              refresh   : true,
              filterPath: null
            },
            defaultParams
          );

  return esClient
    .updateByQuery(params)
    ;
}


function _buildNonDuplicatesUpdateByQuery (duplicatesChain, nonDuplicates, {index, ...options} = {}) {
  if (nonDuplicates.length === 0) return;

  const nonDuplicatesIdConditors = _.map(nonDuplicates, 'idConditor');
  const q = `idConditor:(${nonDuplicatesIdConditors.join(' OR ')})`;

  const painlessParams = {
    nonDuplicates: duplicatesChain
  };

  const params =
          _.defaultsDeep(
            {
              q,
              index,
              body      : {
                script: {
                  lang  : 'painless',
                  inline: validateDuplicate,
                  params: painlessParams
                }
              },
              refresh   : true,
              filterPath: null
            },
            defaultParams
          );

  return esClient
    .updateByQuery(params)
    ;
}

function _toNestedDuplicate ({source, idConditor, isValidatedByUser}) {
  return {source, idConditor, isValidatedByUser};
}
