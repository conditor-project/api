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
  queryStringToParams = require('../queryStringToParams'),
  {indices}           = require('config-component').get()
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
recordsManager.filterRecords = filterRecords;
recordsManager.searchRecords = searchRecords;
recordsManager.filterByCriteria = filterByCriteria;
recordsManager.getScrollStreamFilterByCriteria = getScrollStreamFilterByCriteria;


function getScrollStreamFilterByCriteria (criteria = {}, options = {}) {
  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['includes', 'excludes'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);
      const builder = bodybuilder();

      _.forOwn(criteria, (value, field) => {
        builder.filter('term', field, value);
      });

      const params = _.defaultsDeep(
        {body: builder.build()},
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


function filterByCriteria (criteria = {}, options = {}) {

  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['scroll', 'includes', 'excludes', 'size'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);
      const builder = bodybuilder();

      _.forOwn(criteria, (value, field) => {
        builder.filter('term', field, value);
      });

      const params =
              _.defaultsDeep(
                {'body': builder.build()},
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
      const validOptions    = ['includes', 'excludes'],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);
      const builder = bodybuilder();

      builder.filter('term', 'idConditor', idConditor);

      const params = _.defaultsDeep({
                                      body: builder.build(),
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

function searchRecords (options = {}) {

  return Promise
    .resolve()
    .then(() => {
      const validOptions    = ['scroll', 'includes', 'excludes', 'size'],
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


function getSingleTeiByIdConditor (idConditor, options = {}) {

  return Promise
    .resolve()
    .then(() => {
      const validOptions    = [],
            _invalidOptions = _.difference(_.keys(options), validOptions);

      options = _.pick(options, validOptions);

      const searchBody = bodybuilder().filter('term', 'idConditor', idConditor).build(),
            params     =
              _.defaultsDeep({
                               body          : searchBody,
                               size          : 2, // If hits count =/= 1 then an error is thrown
                               _sourceInclude: 'teiBlob'
                             },
                             queryStringToParams(options),
                             defaultParams
              );

      return esClient
        .search(params)
        .then(esResultFormat.getSingleScalarResult)
        .then(({result, ...rest}) => {
          result = Buffer.from(result, 'base64');
          return _.assign({result}, rest, {'_invalidOptions': _invalidOptions});
        });
    });
}

function filterRecords (options = {}) {
  const searchBody = queryBuilder.filter(options.filter);
  const params = _.defaultsDeep(queryStringToParams(options),
                                defaultParams
  );
  params.body = searchBody;
  return esClient
    .search(params)
    .then(esResultFormat.getResult)
    ;
}
