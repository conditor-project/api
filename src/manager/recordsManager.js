'use strict';

const
  Buffer           = require('buffer').Buffer,
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

const
  defaultParams = {
    index     : 'records',
    filterPath: ['hits.hits._source', 'hits.total', '_scroll_id']
  }
;

recordsManager.getSingleHitByIdConditor = getSingleHitByIdConditor;
recordsManager.getSingleTeiByIdConditor = getSingleTeiByIdConditor;
recordsManager.search = search;
recordsManager.searchRecords = searchRecords;
recordsManager.filterByCriteria = filterByCriteria;
recordsManager.scroll = scroll;


function scroll (queryString = {}) {
  return Promise
    .resolve()
    .then(() => {
      const params =
              _.defaultsDeep(
                _queryStringToParams(queryString),
                _.omit(defaultParams, 'index')
              );

      return esClient
        .scroll(params)
        .then(esResultFormat.getResult)
        ;
    });

}

function filterByCriteria (criteria, queryString = {}) {

  return Promise
    .resolve()
    .then(() => {
      const builder = bodybuilder();

      _.forOwn(criteria, (value, field) => {
        builder.filter('term', field, value);
      });

      const params =
              _.defaultsDeep(
                {body: builder.build()},
                _queryStringToParams(queryString),
                defaultParams);

      return esClient
        .search(params)
        .then(esResultFormat.getResult)
        ;
    });
}

function getSingleHitByIdConditor (idConditor, queryString) {

  return Promise
    .resolve()
    .then(() => {
      const searchBody = bodybuilder().filter('term', 'idConditor', idConditor).build(),
            params     = _.defaultsDeep({body: searchBody},
                                        _queryStringToParams(queryString),
                                        defaultParams
            );

      return esClient
        .search(params)
        .then(esResultFormat.getSingleResult)
        ;
    });
}

function searchRecords (queryString) {

  return Promise
    .resolve()
    .then(() => {
      const params = _.defaultsDeep(_queryStringToParams(queryString),
                                    defaultParams
      );

      return esClient
        .search(params)
        .then(esResultFormat.getResult)
        ;
    });
}


function getSingleTeiByIdConditor (idConditor, queryString) {
  const searchBody = bodybuilder().filter('term', 'idConditor', idConditor).build(),
        params     =
          _.defaultsDeep({
                           body          : searchBody,
                           _sourceInclude: 'teiBlob'
                         },
                         _queryStringToParams(queryString),
                         defaultParams
          );

  return esClient
    .search(params)
    .then(esResultFormat.getSingleScalarResult)
    .then(({result, ...rest}) => {
      result = Buffer.from(result, 'base64');
      return _.assign({result}, rest);
    });
}

function search (query) {
  const
    parsedQuery = parser.parse(query.filter),
    searchBody  = bodybuilder().filter('term', parsedQuery.left.field, parsedQuery.left.term).build();
  console.dir(parsedQuery, {depth: 5});
  console.dir(searchBody, {depth: 5});

  return esClient
    .search({index: 'records', body: searchBody})
    .then(esResultFormat.getResult)
    ;
}

function _queryStringToParams (queryString) {
  const queryStringToParams = {
          scroll   : {
            isValid  : _validateScrollDuration,
            // @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-scroll.html
            transform: (accu, value, key, queryParams) => {if (!queryParams.scroll_id) {accu.sort = ['_doc:asc'];}}
          },
          includes : {mapKey: _.constant('_sourceInclude'), mapValue: split(',')},
          excludes : {mapKey: _.constant('_sourceExclude'), mapValue: split(',')},
          size     : {isValid: _validateSize},
          scroll_id: {mapKey: _.constant('scrollId')}
        }
  ;
  return _(queryString).pick(_.keys(queryStringToParams))
                       .transform(
                         (accu, value, key, queryParams) => {
                           _.invoke(queryStringToParams, [key, 'isValid'], value);

                           const newKey   =
                                   _.has(queryStringToParams, [key, 'mapKey'])
                                     ? _.invoke(queryStringToParams, [key, 'mapKey'], key)
                                     : key,
                                 newValue =
                                   _.has(queryStringToParams, [key, 'mapValue'])
                                     ? _.invoke(queryStringToParams, [key, 'mapValue'], value)
                                     : value
                           ;

                           _.invoke(queryStringToParams, [key, 'transform'], accu, value, key, queryParams);
                           accu[newKey] = newValue;
                         },
                         {}
                       )
                       .value()
    ;
}

function _validateSize (size) {
  if (size > config.elastic.maxSize) throw sizeTooHighException(size, config.elastic.maxSize);
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

function sizeTooHighException (value, maxValue) {
  let err = new Error(`The required size ${value} exceed the maximum  ${maxValue}`);
  err.name = 'sizeTooHighException';
  err.status = 400;
  return err;
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
