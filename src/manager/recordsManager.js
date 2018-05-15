'use strict';

const
  Buffer              = require('buffer').Buffer,
  elasticContainer    = require('../../helpers/clients/elastic').get(),
  esClient            = elasticContainer.main,
  esResultFormat      = require('../../helpers/esResultFormat'),
  bodybuilder         = require('bodybuilder'),
  queryBuilder        = require('../../helpers/queryBuilder'),
  _                   = require('lodash'),
  ScrollStream        = require('elasticsearch-scroll-stream'),
  queryStringToParams = require('../queryStringToParams')
;


const recordsManager = module.exports;

const
  defaultParams = {
    index     : 'records',
    filterPath: ['hits.hits', 'hits.total', '_scroll_id']
  }
;

recordsManager.getSingleHitByIdConditor = getSingleHitByIdConditor;
recordsManager.getSingleTeiByIdConditor = getSingleTeiByIdConditor;
recordsManager.filterRecords = filterRecords;
recordsManager.searchRecords = searchRecords;
recordsManager.filterByCriteria = filterByCriteria;
recordsManager.getScrollStreamFilterByCriteria = getScrollStreamFilterByCriteria;


function getScrollStreamFilterByCriteria (criteria = {}, queryString = {}) {
  return Promise
    .resolve()
    .then(() => {
      queryString = _.pick(queryString, ['includes', 'excludes']);
      const builder = bodybuilder();

      _.forOwn(criteria, (value, field) => {
        builder.filter('term', field, value);
      });

      const params = _.defaultsDeep(
        {body: builder.build()},
        queryStringToParams(queryString),
        defaultParams
      );

      // idConditor is mandatory
      if (params._sourceInclude) {
        params._sourceInclude.push('idConditor');
      }
      if (params._sourceExclude) {
        _.pull(params._sourceExclude, 'idConditor');
      }

      return new ScrollStream(esClient,
                              params,
                              null,
                              {objectMode: true}
      );
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

      queryString = _.pick(queryString, ['scroll', 'includes', 'excludes', 'size']);
      const params =
              _.defaultsDeep(
                {body: builder.build()},
                queryStringToParams(queryString),
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
      queryString = _.pick(queryString, ['includes', 'excludes']);
      const searchBody = bodybuilder().filter('term', 'idConditor', idConditor).build(),
            params     = _.defaultsDeep({
                                          body: searchBody,
                                          size: 2 // If hits count =/= 1 then an error is thrown
                                        },
                                        queryStringToParams(queryString),
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
      queryString = _.pick(queryString, ['scroll', 'includes', 'excludes', 'size']);
      const params = _.defaultsDeep(
        queryStringToParams(queryString),
        defaultParams
      );

      return esClient
        .search(params)
        .then(esResultFormat.getResult)
        ;
    });
}


function getSingleTeiByIdConditor (idConditor, queryString) {

  return Promise
    .resolve()
    .then(() => {
      queryString = _.pick(queryString, []);
      const searchBody = bodybuilder().filter('term', 'idConditor', idConditor).build(),
            params     =
              _.defaultsDeep({
                               body          : searchBody,
                               size          : 2, // If hits count =/= 1 then an error is thrown
                               _sourceInclude: 'teiBlob'
                             },
                             queryStringToParams(queryString),
                             defaultParams
              );

      return esClient
        .search(params)
        .then(esResultFormat.getSingleScalarResult)
        .then(({result, ...rest}) => {
          result = Buffer.from(result, 'base64');
          return _.assign({result}, rest);
        });
    });
}

function filterRecords (queryString) {
  const searchBody = queryBuilder.filter(queryString.filter);
  const params = _.defaultsDeep(queryStringToParams(queryString),
                                defaultParams
  );
  params.body = searchBody;
  return esClient
    .search(params)
    .then(esResultFormat.getResult)
    ;
}
