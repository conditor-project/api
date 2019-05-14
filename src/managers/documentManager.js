'use strict';

const
  {main: esClient}    = require('../../helpers/clients/elastic').startAll().get(),
  {indices}           = require('config-component').get(module),
  _                   = require('lodash'),
  recordsRepository   = require('../repository/recordsRepository')
;

const documentManager = module.exports;

const
  defaultParams = {
    index     : indices.records.index,
    type      : indices.records.type,
    filterPath: ['hits.hits',
                 'hits.hits._source',
                 'hits.hits._score',
                 'hits.hits.sort',
                 'hits.total',
                 '_scroll_id',
                 'aggregations']
  }
;

documentManager.index = index;

function index (docObjects, index) {
  const params =
          _.defaultsDeep(
            {
              index,
              body: recordsRepository.buildIndexBody(docObjects)
            },
            defaultParams
          );

  return esClient.bulk(params);
}
