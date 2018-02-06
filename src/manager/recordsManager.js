'use strict';

const
  elasticContainer = require('../../helpers/clients/elastic').get(),
  esClient         = elasticContainer.main,
  esResultFormat   = require('../../helpers/esResultFormat'),
  logger           = require('../../helpers/logger'),
  logInfo          = logger.logInfo,
  logError         = logger.logError,
  parser           = require('lucene-query-parser'),
  bodybuilder      = require('bodybuilder'),
  _                = require('lodash')
;


const recordsManager = module.exports;

recordsManager.getSingleHitByIdConditor = getSingleHitByIdConditor;
recordsManager.getSinglePathByIdConditor = getSinglePathByIdConditor;
recordsManager.search = search;
recordsManager.searchAll = searchAll;
recordsManager.filterByCriteria = filterByCriteria;

function filterByCriteria (criteria) {
  const builder = bodybuilder();

  _.forOwn(criteria, (value, field) => {
    builder.filter('term', field, value);
  });

  return esClient
    .search({
              index     : 'notices',
              filterPath: 'hits.hits._source, hits.total',
              body      : builder.build()
            })
    .then(esResultFormat.getResult)
    ;

}

function searchAll () {
  return esClient
    .search({index: 'notices', filterPath: 'hits.hits._source, hits.total'})
    .then(esResultFormat.getResult)
    ;
}

function getSinglePathByIdConditor(idConditor){
  return esClient
    .search({index: 'notices', q: `idConditor:"${idConditor}"`, filterPath: 'hits.hits._source.path, hits.total', size: 1})
    .then(esResultFormat.getSingleScalarResult)
    .catch((err) => {
      err.context = 'getSingleHitByIdConditor';
      err.args = arguments;
      throw err;
    });
}

function getSingleHitByIdConditor (idConditor) {
  return esClient
    .search({index: 'notices', q: `idConditor:"${idConditor}"`, filterPath: 'hits.hits._source, hits.total', size: 1})
    .then(esResultFormat.getSingleHit)
    .catch((err) => {
      err.context = 'getSingleHitByIdConditor';
      err.args = arguments;
      throw err;
    });
}

function search (query) {
  const
    parsedQuery = parser.parse(query.filter),
    searchBody  = bodybuilder().filter('term', parsedQuery.left.field, parsedQuery.left.term).build();
  console.dir(parsedQuery, {depth: 5});
  console.dir(searchBody, {depth: 5});
  //return esClient
  //  .search({index: 'notices',  q:query.q})
  //  ;
  return esClient
    .search({index: 'notices', body: searchBody})
    .then(esResultFormat.getResult)
    ;
}

function _escapeLuceneQuery (query) {
  return query.replace(/([\!\*\+\&\|\(\)\[\]\{\}\^\~\?\:\"])/g, '\\$1');
}
