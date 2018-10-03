'use strict';

const
  Buffer                                             = require('buffer').Buffer,
  {main: esClient}                                   = require('../../helpers/clients/elastic').startAll().get(),
  {indices}                                          = require('config-component').get(module),
  esResultFormat                                     = require('../../helpers/esResultFormat'),
  esb                                                = require('elastic-builder/src'),
  _                                                  = require('lodash'),
  ScrollStream                                       = require('elasticsearch-scroll-stream'),
  queryStringToParams                                = require('../queryStringToParams'),
  {buildFilterByCriteriaBoolQuery, buildRequestBody} = require('../repository/recordsRepository')
;

const recordsManager = module.exports;

const
  defaultParams = {
    index     : indices.records.index,
    filterPath: ['hits.hits', 'hits.total', '_scroll_id', 'aggregations']
  }
;

recordsManager.getSingleHitByIdConditor = getSingleHitByIdConditor;
recordsManager.getSingleTeiByIdConditor = getSingleTeiByIdConditor;
recordsManager.searchRecords = searchRecords;
recordsManager.filterByCriteria = filterByCriteria;
recordsManager.getScrollStreamFilterByCriteria = getScrollStreamFilterByCriteria;


function getScrollStreamFilterByCriteria (filterCriteria = {}, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['includes', 'excludes', 'q', 'access_token', 'limit'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const
        requestBody = buildRequestBody(options.q, options.aggs, filterCriteria)
      ;

      const params =
              _.defaultsDeep(
                {
                  body: requestBody.toJSON(),
                  size: 500
                },
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

      if (options.limit) {
        let recordsCount = 0;
        const limit = scrollStream._resultCount = _.toSafeInteger(options.limit);
        scrollStream
          .on('data', () => {
            ++recordsCount;
            if (recordsCount > limit) {
              scrollStream.close();
              scrollStream._isClosed = true;
            }
          });
      }

      return scrollStream
        .on('error', (err) => {
          if (['TypeError'].includes(err.name)) {err.status = 400;}
        });
    });


}


function filterByCriteria (filterCriteria, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['scroll', 'includes', 'excludes', 'size', 'access_token', 'q', 'aggs'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const
        requestBody = buildRequestBody(options.q, options.aggs, filterCriteria)
      ;

      const params =
              _.defaultsDeep(
                {'body': requestBody.toJSON()},
                queryStringToParams(options),
                defaultParams);

      return esClient
        .search(params)
        .catch(_clientErrorHandler)
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
      const validOptions    = ['includes', 'excludes','aggs', 'access_token'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const
        requestBody = buildRequestBody('*', options.aggs, {idConditor})
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
        .catch(_clientErrorHandler)
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

      const params =
              _.defaultsDeep({
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
        .catch(_clientErrorHandler)
        .then(esResultFormat.getSingleScalarResult)
        .then(({result, ...rest}) => {
          result = Buffer.from(result, 'base64');
          return _.assign({result}, rest, {'_invalidOptions': _invalidOptions});
        });
    });
}


function searchRecords (options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['scroll', 'includes', 'excludes', 'size', 'q', 'aggs', 'access_token'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const
        requestBody = buildRequestBody(options.q, options.aggs)
      ;

      const params = _.defaultsDeep(
        {body: requestBody.toJSON()},
        queryStringToParams(options),
        defaultParams
      );

      return esClient
        .search(params)
        .catch(_clientErrorHandler)
        .then(esResultFormat.getResult)
        .then((result) => {
          result._invalidOptions = _invalidOptions;
          return result;
        })
        ;
    });
}

function _clientErrorHandler (err) {
  if (['TypeError'].includes(err.name)) {err.status = 400;}
  throw err;
}
