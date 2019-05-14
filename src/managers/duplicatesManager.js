'use strict';

const
  {main: esClient} = require('../../helpers/clients/elastic').startAll().get(),
  {indices}        = require('config-component').get(module),
  _                = require('lodash'),
  fs               = require('fs-extra'),
  path             = require('path')
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

function updateDuplicatesTree (initialRecord, {reportDuplicates = [], reportNonDuplicates = []} = {}, {index, ...options} = {}) {
  const duplicatesChain =
          _([initialRecord])
            .concat(
              _.get(initialRecord, 'duplicates', []),
              reportDuplicates,
              _.flatMap(reportDuplicates, 'duplicates')
            )
            .compact()
            .uniq()
            .map(toNestedDuplicate)
            .value()
  ;

  const idConditors = _.map(duplicatesChain, 'idConditor');
  const duplicatesIdChain = '';
  const q = `idConditor:(${idConditors.join(' OR ')})`;
  const painlessParams = {
    duplicates   : duplicatesChain,
    nonDuplicates: reportNonDuplicates,
    duplicatesIdChain
  };
  console.dir(duplicatesChain, {depth: 10});
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
              filterPath: null
            },
            defaultParams
          );

  return esClient
    .updateByQuery(params);
}

function toNestedDuplicate ({source, idConditor}) {
  return {source, idConditor};
}
