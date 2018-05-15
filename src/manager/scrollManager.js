'use strict';

const
  elasticContainer    = require('../../helpers/clients/elastic').get(),
  esClient            = elasticContainer.main,
  esResultFormat      = require('../../helpers/esResultFormat'),
  _                   = require('lodash'),
  queryStringToParams = require('../queryStringToParams')
;


const scrollManager = module.exports;

const
  defaultParams = {
    filterPath: ['hits.hits', 'hits.total', '_scroll_id'],
    scroll:'30s'
  }
;

scrollManager.scroll = scroll;


function scroll (scrollId, queryString = {}) {
  return Promise
    .resolve()
    .then(() => {
      queryString = _.pick(queryString, ['scroll']);
      queryString.scroll_id = scrollId;

      const params =
              _.defaultsDeep(
                queryStringToParams(queryString),
                defaultParams
              );

      return esClient
        .scroll(params)
        .then(esResultFormat.getResult)
        ;
    });
}
