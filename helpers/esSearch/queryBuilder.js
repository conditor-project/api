'use strict';
const {
  elastic: {
    queryString: { allowLeadingWildcard, maxDeterminizedStates, lenient }
  }
} = require('config-component').get(module);
const esb = require('elastic-builder/src');
const parser = require('./parser');

const queryBuilder = module.exports;

queryBuilder.build = build;

function build (searchQueryString) {
  const ast = parser.parse(searchQueryString);

  return ast.map(item => {
    if (item.hasOwnProperty('nestedPaths') && item.nestedPaths.length > 0) {
      return buildNestedQuery(item.nestedPaths, item.queryString);
    }
    return buildQueryStringQuery(item.queryString);
  });
}

function buildNestedQuery (nestedPaths = [], queryString = '') {
  return buildRecursively(nestedPaths, queryString, '');

  function buildRecursively (nestedPaths, queryString, prevNestedPath) {
    const nestedPath = (prevNestedPath) ? `${prevNestedPath}.${nestedPaths.shift()}` : nestedPaths.shift();
    if (nestedPaths.length > 0) {
      return esb.nestedQuery()
        .path(nestedPath)
        .query(
          esb.boolQuery().must(
            buildRecursively(nestedPaths, queryString, nestedPath)
          )
        );
    } else {
      return esb.nestedQuery()
        .path(nestedPath)
        .query(
          esb.boolQuery().must(
            buildQueryStringQuery(queryString)
          )
        );
    }
  }
}

function buildQueryStringQuery (queryString) {
  return esb.queryStringQuery(queryString)
    .allowLeadingWildcard(allowLeadingWildcard)
    .maxDeterminizedStates(maxDeterminizedStates)
    .lenient(lenient);
}
