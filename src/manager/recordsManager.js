'use strict';

const
  Buffer                           = require('buffer').Buffer,
  {main: esClient}                 = require('../../helpers/clients/elastic').startAll().get(),
  {
    elastic: {queryString: {allowLeadingWildcard, maxDeterminizedStates}},
    indices
  }                                = require('config-component').get(module),
  esResultFormat                   = require('../../helpers/esResultFormat'),
  bodybuilder                      = require('bodybuilder'),
  esb                              = require('elastic-builder/src'),
  _                                = require('lodash'),
  ScrollStream                     = require('elasticsearch-scroll-stream'),
  queryStringToParams              = require('../queryStringToParams'),
  {logDebug, logError}             = require('../../helpers/logger'),
  {buildFilterByCriteriaBoolQuery} = require('../repository/recordsRepository')
;

const recordsManager = module.exports;

const
  defaultParams = {
    index     : indices.records.index,
    filterPath: ['hits.hits', 'hits.total', '_scroll_id']
  }
;

recordsManager.getSingleHitByIdConditor = getSingleHitByIdConditor;
recordsManager.getSingleTeiByIdConditor = getSingleTeiByIdConditor;
recordsManager.searchRecords = searchRecords;
recordsManager.searchAllRecords = searchAllRecords;
recordsManager.filterByCriteria = filterByCriteria;
recordsManager.getScrollStreamFilterByCriteria = getScrollStreamFilterByCriteria;


function getScrollStreamFilterByCriteria (criteria = {}, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['includes', 'excludes', 'q', 'access_token'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const
        requestBody =
          esb.requestBodySearch()
             .query(buildFilterByCriteriaBoolQuery(criteria, options.q))
      ;

      const params = _.defaultsDeep(
        {body: requestBody.toJSON()},
        queryStringToParams(options),
        defaultParams
      );

      // idConditor is mandatory
      if (params._sourceInclude) {
        params._sourceInclude.push('idConditor');
      }
      if (params._sourceExclude) {
        _.pull(params._sourceExclude, 'idConditor');
      }

      const scrollStream = new ScrollStream(esClient,
                                            params,
                                            null,
                                            {objectMode: true}
      );

      scrollStream._invalidOptions = _invalidOptions;

      return scrollStream;
    });


}


function filterByCriteria (criteria, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['scroll', 'includes', 'excludes', 'size', 'access_token', 'q'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const
        requestBody =
          esb.requestBodySearch()
             .query(buildFilterByCriteriaBoolQuery(criteria, options.q))
      ;

      const params =
              _.defaultsDeep(
                {'body': requestBody.toJSON()},
                queryStringToParams(options),
                defaultParams);

      return esClient
        .search(params)
        .then(esResultFormat.getResult)
        .then((result) => {
          result._invalidOptions = _invalidOptions;
          return result;
        })
        ;
    });
}

function getSingleHitByIdConditor (idConditor, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['includes', 'excludes', 'access_token'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const
        requestBody =
          esb.requestBodySearch()
             .query(buildFilterByCriteriaBoolQuery({idConditor}))
      ;

      const params = _.defaultsDeep({
                                      body: requestBody.toJSON(),
                                      size: 2 // If hits count =/= 1 then an error is thrown
                                    },
                                    queryStringToParams(options),
                                    defaultParams
      );

      return esClient
        .search(params)
        .then(esResultFormat.getSingleResult)
        .then((result) => {
          result._invalidOptions = _invalidOptions;
          return result;
        })
        ;
    });
}

function getSingleTeiByIdConditor (idConditor, options = {}) {

  return Promise
    .resolve()
    .then(() => {
      const validOptions    = [],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const requestBody
              = esb.requestBodySearch()
                   .query(buildFilterByCriteriaBoolQuery({idConditor}))
      ;

      const params
              = _.defaultsDeep({
                                 body          : requestBody.toJSON(),
                                 size          : 2, // If hits count =/= 1 then an error is thrown
                                 _sourceInclude: 'teiBlob'
                               },
                               queryStringToParams(options),
                               defaultParams
            )
      ;

      return esClient
        .search(params)
        .then(esResultFormat.getSingleScalarResult)
        .then(({result, ...rest}) => {
          result = Buffer.from(result, 'base64');
          return _.assign({result}, rest, {'_invalidOptions': _invalidOptions});
        });
    });
}


function searchAllRecords (options = {}) {

  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['scroll', 'includes', 'excludes', 'size', 'access_token'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const params = _.defaultsDeep(
        queryStringToParams(options),
        defaultParams
      );

      return esClient
        .search(params)
        .then(esResultFormat.getResult)
        .then((result) => {
          result._invalidOptions = _invalidOptions;
          return result;
        })
        ;
    });
}

function searchRecords (options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['scroll', 'includes', 'excludes', 'size', 'q', 'access_token'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const
        requestBody =
          esb.requestBodySearch()
             .query(buildFilterByCriteriaBoolQuery({}, options.q))
      ;

      const params = _.defaultsDeep(
        {body: requestBody.toJSON()},
        queryStringToParams(options),
        defaultParams
      );

      return esClient
        .search(params)
        .then(esResultFormat.getResult)
        .then((result) => {
          result._invalidOptions = _invalidOptions;
          return result;
        })
        ;
    });
}
