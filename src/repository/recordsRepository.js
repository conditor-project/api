'use strict';
const {
        elastic: {queryString: {allowLeadingWildcard, maxDeterminizedStates}}
      }   = require('config-component').get(module),
      esb = require('elastic-builder/src'),
      _   = require('lodash')
;

const recordsRepository = module.exports;

recordsRepository.buildTermQueriesByCriteria = buildTermQueriesByCriteria;
recordsRepository.buildQueryStringQuery = buildQueryStringQuery;
recordsRepository.buildFilterByCriteriaBoolQuery = buildFilterByCriteriaBoolQuery;


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
