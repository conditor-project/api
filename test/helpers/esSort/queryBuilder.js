'use strict';

const queryBuilder = require('../../../helpers/esSort/queryBuilder'),
      _            = require('lodash'),
      should       = require('should') // jshint ignore:line
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
    query: 'nearDuplicates.similarityRate:{nested:{path: nearDuplicates}}'
  },
  {
    query: 'nearDuplicates.similarityRate:desc:avg:{nested:{path: nearDuplicates}}'
  },
  {
    query: 'nearDuplicates.similarityRate: desc : AVG: { nested: {path: nearDuplicates}}'
  },
  {
    query: 'nearDuplicates.similarityRate:desc:avg:{nested:{path: nearDuplicates}} authorNames:min'
  },
  {
    query: 'authors.idConditor:{nested: { path: authors }}'
  },
  {
    query: 'nearDuplicates.similarityRate:{nested: { path: nearDuplicates, nested:{ path: parent} }}'
  },
  {
    query: 'nearDuplicates.similarityRate:{unmapped_type: long, missing: _last}'
  }
];

describe('esSort: ', () => {
  describe('queryBuilder#build(sortQueryString)', () => {
    _.forEach(queries, ({query, message}) => {
      describe(`"${query}"`, () => {
        it(message || 'Should build esSortQuery without throwing', () => {
          queryBuilder.build(query);
        });
      });
    });
  });
});
