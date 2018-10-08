'use strict';
const {
        elastic: {queryString: {allowLeadingWildcard, maxDeterminizedStates}}
      }                         = require('config-component').get(module),
      esb                       = require('elastic-builder/src'),
      _                         = require('lodash'),
      {build: buildAggregation} = require('../helpers/esAggregation/queryBuilder')
;

const documentQueryBuilder = module.exports;

documentQueryBuilder.buildRequestBody = buildRequestBody;


function buildRequestBody (luceneQueryString, aggsQueryString, filterCriteria = {}) {

  luceneQueryString = _.isNil(luceneQueryString) ? '*' : luceneQueryString;
  aggsQueryString = _.isNil(aggsQueryString) ? '' : aggsQueryString;

  return esb
    .requestBodySearch()
    .query(
      esb
        .boolQuery()
        .filter(
          _buildTermQueriesByCriteria(filterCriteria)
        )
        .must(
          _buildQueryStringQuery(luceneQueryString)
        )
    )
    .aggs(_buildAggregation(aggsQueryString))
    ;
}

function _buildTermQueriesByCriteria (criteria) {
  return _.transform(criteria,
                     (filters, value, field) => {
                       filters.push(esb.termQuery(field, value));
                     },
                     []);
}

function _buildQueryStringQuery (queryLucene) {
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
