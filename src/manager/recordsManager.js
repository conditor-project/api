'use strict';

const
  Buffer              = require('buffer').Buffer,
  {main: esClient}    = require('../../helpers/clients/elastic').startAll().get(),
  {indices}           = require('config-component').get(module),
  esResultFormat      = require('../../helpers/esResultFormat'),
  _                   = require('lodash'),
  ScrollStream        = require('elasticsearch-scroll-stream'),
  queryStringToParams = require('../queryStringToParams'),
  {buildRequestBody}  = require('../documentQueryBuilder')
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
recordsManager.search = search;
recordsManager.filterByCriteria = filterByCriteria;
recordsManager.getScrollStreamFilterByCriteria = getScrollStreamFilterByCriteria;
recordsManager.getDuplicatesByIdConditor = getDuplicatesByIdConditor;
recordsManager.getNearDuplicatesByIdConditor = getNearDuplicatesByIdConditor;

getScrollStreamFilterByCriteria.options = ['include', 'exclude', 'q', 'limit'];
function getScrollStreamFilterByCriteria (filterCriteria = {}, options = {}) {
  return Promise
    .resolve()
    .then(() => {
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

filterByCriteria.options = ['scroll', 'include', 'exclude', 'page', 'page_size', 'q', 'aggs'];
function filterByCriteria (filterCriteria, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const
        requestBody = buildRequestBody(options.q, options.aggs, filterCriteria)
      ;

      const params =
              _.defaultsDeep(
                {'body': requestBody.toJSON()},
                queryStringToParams(options),
                defaultParams);

      const paginate = _.curryRight(esResultFormat.paginate, 3)(params.size)(params.from);

      return esClient
        .search(params)
        .catch(_clientErrorHandler)
        .then(esResultFormat.getResult)
        .then(paginate)
        ;
    });
}

getSingleHitByIdConditor.options = ['include', 'exclude', 'aggs'];
function getSingleHitByIdConditor (idConditor, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const
        requestBody = buildRequestBody(null, options.aggs, {idConditor})
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
        ;
    });
}

getSingleTeiByIdConditor.options = [];
function getSingleTeiByIdConditor (idConditor, options = {}) {

  return Promise
    .resolve()
    .then(() => {
      const
        requestBody = buildRequestBody(null, null, {idConditor})
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
          return _.assign({result}, rest);
        });
    });
}


search.options = ['scroll', 'include', 'exclude', 'page', 'page_size', 'q', 'aggs'];
function search (options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const
        requestBody = buildRequestBody(options.q, options.aggs)
      ;

      const params = _.defaultsDeep(
        {body: requestBody.toJSON()},
        queryStringToParams(options),
        defaultParams
      );
      const paginate = _.curryRight(esResultFormat.paginate, 3)(params.size)(params.from);

      return esClient
        .search(params)
        .catch(_clientErrorHandler)
        .then(esResultFormat.getResult)
        .then(paginate)
        ;
    });
}

getDuplicatesByIdConditor.options = ['include', 'exclude', 'aggs', 'page', 'page_size', 'q'];
function getDuplicatesByIdConditor (idConditor, options = {}, flag = '') {
  const AND_SELF = 'and_self';

  return Promise
    .resolve()
    .then(() => {
      const
        requestBody = buildRequestBody(null, null, {idConditor})
      ;
      const params = _.defaultsDeep({
                                      body: requestBody.toJSON(),
                                      size: 2 // If hits count =/= 1 then an error is thrown
                                    },
                                    queryStringToParams({include: 'duplicate.idConditor'}),
                                    defaultParams
      );

      return esClient
        .search(params)
        .catch(_clientErrorHandler)
        .then(esResultFormat.getSingleResult)
        .then((result) => {
          const idConditors = _.chain(result)
                               .get('result.duplicate', [])
                               .transform((accu, duplicate) => {
                                 accu.push(_.get(duplicate, 'idConditor', ''));
                               })
                               .value()
          ;

          if (flag === AND_SELF) idConditors.push(idConditor);

          const
            requestBody = buildRequestBody(options.q, options.aggs, {idConditor: idConditors})
          ;
          const params = _.defaultsDeep({
                                          body: requestBody.toJSON()
                                        },
                                        queryStringToParams(options),
                                        defaultParams
          );
          const paginate = _.curryRight(esResultFormat.paginate, 3)(params.size || idConditors.length)(params.from);

          return esClient
            .search(params)
            .catch(_clientErrorHandler)
            .then(esResultFormat.getResult)
            .then(paginate)
            .then((result) => {
              if (!options.q && result.totalCount < idConditors.length) {
                result.addWarning({
                                    code: 199,
                                    text: `Expected nested duplicate total is ${idConditors.length} for record ${idConditor}, but got ${result.totalCount}`
                                  });
              }
              return result;
            })
            ;
        })
        ;
    });
}


getNearDuplicatesByIdConditor.options = ['include', 'exclude', 'aggs', 'page', 'page_size', 'q'];
function getNearDuplicatesByIdConditor (idConditor, options = {}, flag = '') {
  const AND_SELF = 'and_self';

  return Promise
    .resolve()
    .then(() => {
      const
        requestBody = buildRequestBody(null, null, {idConditor})
      ;
      const params = _.defaultsDeep({
                                      body: requestBody.toJSON(),
                                      size: 2 // If hits count =/= 1 then an error is thrown
                                    },
                                    queryStringToParams({include: 'nearDuplicate.idConditor'}),
                                    defaultParams
      );

      return esClient
        .search(params)
        .catch(_clientErrorHandler)
        .then(esResultFormat.getSingleResult)
        .then((result) => {
          const idConditors = _.chain(result)
                               .get('result.nearDuplicate', [])
                               .transform((accu, duplicate) => {
                                 accu.push(_.get(duplicate, 'idConditor', ''));
                               })
                               .value()
          ;

          if (flag === AND_SELF) idConditors.push(idConditor);

          const
            requestBody = buildRequestBody(options.q, options.aggs, {idConditor: idConditors})
          ;
          const params = _.defaultsDeep({
                                          body: requestBody.toJSON()
                                        },
                                        queryStringToParams(options),
                                        defaultParams
          );
          const paginate = _.curryRight(esResultFormat.paginate, 3)(params.size || idConditors.length)(params.from);

          return esClient
            .search(params)
            .catch(_clientErrorHandler)
            .then(esResultFormat.getResult)
            .then(paginate)
            .then((result) => {
              if (!options.q && result.totalCount < idConditors.length) {
                result.addWarning({
                                    code: 199,
                                    text: `Expected nested nearDuplicate total is ${idConditors.length} for record ${idConditor}, but got ${result.totalCount}`
                                  });
              }
              return result;
            })
            ;
        })
        ;
    });
}
function _clientErrorHandler (err) {
  if (['TypeError'].includes(err.name)) {err.status = 400;}
  throw err;
}
