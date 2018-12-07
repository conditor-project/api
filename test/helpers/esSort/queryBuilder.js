'use strict';

const queryBuilder = require('../../../helpers/esSort/queryBuilder'),
      _            = require('lodash'),
      should       = require('should'), // jshint ignore:line
      esb          = require('elastic-builder/src')
;

const queries = [
  {
    query: ''
  },
  {
    query: 'title.normalized'
  },
  {
    query: 'title:asc'
  },
  {
    query: 'rate:desc:avg'
  },
  {
    query: 'rate:sum'
  },
  {
    query: ' "pi:rate" : Sum '
  },
  {
    query: 'nearDuplicate.similarityRate:{nested:{path: nearDuplicate}}'
  },
  {
    query: 'nearDuplicate.similarityRate:desc:avg:{nested:{path: nearDuplicate}}'
  },
  {
    query: 'nearDuplicate.similarityRate: desc : AVG: { nested: {path: nearDuplicate}}'
  },
  {
    query: 'nearDuplicate.similarityRate:desc:avg:{nested:{path: nearDuplicate}} authorNames:min'
  },
  {
    query: 'authorRef.idConditor:{nested: { path: authorRef }}'
  },
  {
    query: 'nearDuplicate.similarityRate:{nested: { path: nearDuplicate, nested:{ path: parent} }}'
  },
  {
    query: 'nearDuplicate.similarityRate:{unmapped_type: long, missing: _last}'
  }
];

describe('esSort: ', () => {
  describe('queryBuilder#build(sortQueryString)', () => {
    _.forEach(queries, ({query, message}) => {
      describe(`"${query}"`, () => {
        it(message || 'Should build correct esSortQuery', () => {
          queryBuilder.build(query);
        });
      });
    });
  });
});