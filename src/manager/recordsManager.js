'use strict';

const
  elasticContainer = require('../../helpers/clients/elastic').get(),
  esClient         = elasticContainer.main,
  config           = require('config-component').get(),
  esResultFormat   = require('../../helpers/esResultFormat'),
  logger           = require('../../helpers/logger'),
  logInfo          = logger.logInfo,
  logError         = logger.logError,
  parser           = require('lucene-query-parser'),
  bodybuilder      = require('bodybuilder'),
  moment           = require('moment'),
  _                = require('lodash'),
  split            = require('lodash/fp/split')
;


const recordsManager = module.exports;

const defaultParams   = {},
      mandatoryParams = {
        index     : 'notices'
        //,
        //filterPath: 'hits.hits._source, hits.total, _scroll_id'
      }
;

recordsManager.getSingleHitByIdConditor = getSingleHitByIdConditor;
recordsManager.getSinglePathByIdConditor = getSinglePathByIdConditor;
recordsManager.search = search;
recordsManager.searchRecords = searchRecords;
recordsManager.filterByCriteria = filterByCriteria;
recordsManager.scroll = scroll;


function scroll (queryString = {}) {
  return new Promise((resolve, reject) => {
    const params = _.defaultsDeep({},
                                  {
                                    filterPath: 'hits.hits._source, hits.total, _scroll_id'
                                  },
                                  _queryStringToParams(queryString),
                                  defaultParams);
    esClient
      .scroll(params)
      .then(esResultFormat.getResult)
      .then(resolve)
      .catch(reject)
    ;
  });
}

function filterByCriteria (criteria, queryString = {}) {

  return new Promise((resolve, reject) => {
    const builder = bodybuilder();

    _.forOwn(criteria, (value, field) => {
      builder.filter('term', field, value);
    });

    const params = _.defaultsDeep({},
                                  mandatoryParams,
                                  {body: builder.build()},
                                  _queryStringToParams(queryString),
                                  defaultParams);
    esClient
      .search(params)
      .then(esResultFormat.getResult)
      .then(resolve)
      .catch(reject)
    ;
  });
}

function getSingleHitByIdConditor (idConditor, queryString) {
  return new Promise((resolve, reject) => {

    const params = _.defaultsDeep({size:1, q: `idConditor:"${idConditor}"`},
                                  mandatoryParams,
                                  _queryStringToParams(queryString),
                                  defaultParams);
    return esClient
      .search(params)
      .then(esResultFormat.getSingleHit)
      .then(resolve)
      .catch(reject)
    ;
  });
}

function searchRecords (queryString) {
  const params = _queryStringToParams(queryString);
  return esClient
    .search({index: 'notices', filterPath: 'hits.hits._source, hits.total, _scroll_id'})
    .then(esResultFormat.getResult)
    ;
}

function getSinglePathByIdConditor (idConditor) {
  return esClient
    .search({
              index     : 'notices',
              q         : `idConditor:"${idConditor}"`,
              filterPath: 'hits.hits._source.path, hits.total',
              size      : 1
            })
    .then(esResultFormat.getSingleScalarResult)
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
function _queryStringToParams (queryString) {
  const queryStringToParams = {
          scroll   : {isValid: _validateScrollDuration},
          includes : {mapKey: _.constant('_sourceInclude'), mapValue: split(',')},
          excludes : {mapKey: _.constant('_sourceExclude'), mapValue: split(',')},
          size     : {},
          scroll_id: {mapKey: _.constant('scrollId')}
        }
  ;

  return _(queryString)
    .pick(_.keys(queryStringToParams))
    .transform(
      (accu, value, key) => {
        const newKey   = _.has(queryStringToParams, [key, 'mapKey']) ? _.invoke(queryStringToParams,
                                                                                [key, 'mapKey'],
                                                                                key) : key,
              newValue = _.has(queryStringToParams, [key, 'mapValue']) ? _.invoke(queryStringToParams,
                                                                                  [key, 'mapValue'],
                                                                                  value) : value
        ;
        _.invoke(queryStringToParams, [key, 'isValid'], value);

        accu[newKey] = newValue;
      },
      {}
    )
    .value()
    ;
}

function _validateScrollDuration (durationString) {

  let scrollDuration,
      maxDuration = _convertDurationStringToSecond(config.elastic.maxScrollDuration)
  ;
  try {
    scrollDuration = _convertDurationStringToSecond(durationString);
  } catch (err) {
    // Do nothing and let elastic handle the error of parsing
  }

  if (scrollDuration > maxDuration) throw invalidScrollDurationException(scrollDuration, maxDuration);
}

function invalidScrollDurationException (scrollDuration, maxScrollDuration) {
  let err = new Error(`The required scroll duration ${scrollDuration} exceed the maximum duration ${maxScrollDuration}`);
  err.name = 'invalidScrollDurationException';
  err.status = 400;
  return err;
}

function _convertDurationStringToSecond (durationString) {
  const parsedDuration = _parseDurationString(durationString);
  return moment.duration(+parsedDuration.duration, parsedDuration.unit).asSeconds();
}

function _parseDurationString (durationString) {
  let parsedDuration = {};
  ({1: parsedDuration.duration, 2: parsedDuration.unit} = _.trim(durationString)
                                                           .match(/^(\d+)[ ]*(d|h|m|s|ms|micros|nanos)$/i));
  return parsedDuration;
}

function _escapeLuceneQuery (query) {
  return query.replace(/([\!\*\+\&\|\(\)\[\]\{\}\^\~\?\:\"])/g, '\\$1');
}
