'use strict';
const {
        elastic: {queryString: {allowLeadingWildcard, maxDeterminizedStates}}
      }                         = require('config-component').get(module),
      esb                       = require('elastic-builder/src'),
      _                         = require('lodash'),
      {build: buildAggregation} = require('../../helpers/esAggregation/queryBuilder')
;

const recordsRepository = module.exports;

recordsRepository.buildTermQueriesByCriteria = buildTermQueriesByCriteria;
recordsRepository.buildQueryStringQuery = buildQueryStringQuery;
recordsRepository.buildFilterByCriteriaBoolQuery = buildFilterByCriteriaBoolQuery;
recordsRepository.buildRequestBody = buildRequestBody;

function buildRequestBody (luceneQueryString = '*', aggsQueryString = '', filterCriteria = {}) {

  return esb
    .requestBodySearch()
    .query(
      esb
        .boolQuery()
        .filter(
          recordsRepository
            .buildTermQueriesByCriteria(filterCriteria)
        )
        .must(
          recordsRepository
            .buildQueryStringQuery(luceneQueryString)
        )
    )
    .aggs(_buildAggregation(aggsQueryString))
    ;
}

function buildFilterByCriteriaBoolQuery (criteria, queryLucene) {
  const boolQuery = esb.boolQuery();

  boolQuery.filter(recordsRepository.buildTermQueriesByCriteria(criteria));

  if (typeof queryLucene === 'string') {
    boolQuery.must(recordsRepository.buildQueryStringQuery(queryLucene));
  }

  return boolQuery;
}

function buildTermQueriesByCriteria (criteria) {
  return _.transform(criteria,
                     (filters, value, field) => {
                       filters.push(esb.termQuery(field, value));
                     },
                     []);
}

function buildQueryStringQuery (queryLucene) {
  return esb
    .queryStringQuery(queryLucene)
    .allowLeadingWildcard(allowLeadingWildcard)
    .maxDeterminizedStates(maxDeterminizedStates);
}


function _buildAggregation (aggsQueryString) {
  try {
    return buildAggregation(aggsQueryString);
  } catch (err) {
    if ((err.name === 'SyntaxError' && err.isPeg === true)
        || (err.name === 'ValidationError' && err.isJoi === true)
    ) {
      err.status = 400;
    }
    throw err;
  }
}
