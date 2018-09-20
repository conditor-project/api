'use strict';

const
  Buffer                           = require('buffer').Buffer,
  {main: esClient}                 = require('../../helpers/clients/elastic').startAll().get(),
  {indices}                        = require('config-component').get(module),
  esResultFormat                   = require('../../helpers/esResultFormat'),
  esb                              = require('elastic-builder/src'),
  _                                = require('lodash'),
  ScrollStream                     = require('elasticsearch-scroll-stream'),
  queryStringToParams              = require('../queryStringToParams'),
  {buildFilterByCriteriaBoolQuery} = require('../repository/recordsRepository'),
  {build: buildAggregation}        = require('../../helpers/aggregationQueryBuilder')
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


function getScrollStreamFilterByCriteria (criteria = {}, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['includes', 'excludes', 'q', 'access_token', 'size'],
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

      return scrollStream
        .on('error', (err) => {
          if (['TypeError'].includes(err.name)) {err.status = 400;}
        });
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
        .catch(clientErrorHandler)
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
        .catch(clientErrorHandler)
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
        .catch(clientErrorHandler)
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
        requestBody =
          esb.requestBodySearch()
             .query(buildFilterByCriteriaBoolQuery({}, options.q))
      ;

      if (options.aggs) {
        let aggs;
        try {
          aggs = buildAggregation(options.aggs);
        } catch (err) {
          if (['SyntaxError', 'ValidationError'].includes(err.name)) {
            err.status = 400;
          }
          throw err;
        }
        requestBody.aggs(aggs);
      }
//console.dir(requestBody.toJSON())
      const params = _.defaultsDeep(
        {body: requestBody.toJSON()},
        queryStringToParams(options),
        defaultParams
      );

      return esClient
        .search(params)
        .catch(clientErrorHandler)
        .then(esResultFormat.getResult)
        .then((result) => {
          result._invalidOptions = _invalidOptions;
          return result;
        })
        ;
    });
}

function clientErrorHandler (err) {
  if (['TypeError'].includes(err.name)) {err.status = 400;}
  throw err;
}
