'use strict';

const parser = require('../../../helpers/esSort/parser'),
      should = require('should'), // jshint ignore:line
      _      = require('lodash')
;

const expectedAst = [
  {
    query   : '',
    expected: []
  },
  {
    query   : 'title.normalized',
    expected: [{field: 'title.normalized'}]
  },
  {
    query   : 'title:asc',
    expected: [{field: 'title', order: 'asc'}]
  },
  {
    query   : 'rate:desc:avg',
    expected: [{field: 'rate', order: 'desc', mode: 'avg'}]
  },
  {
    query   : 'rate:sum',
    expected: [{field: 'rate', mode: 'sum'}]
  },
  {
    query   : ' "pi:rate" : Sum ',
    expected: [{field: 'pi:rate', mode: 'sum'}]
  },
  {
    query   : 'nearDuplicates.similarityRate:{nested:{path: nearDuplicates}}',
    expected: [{field: 'nearDuplicates.similarityRate', nested: {path: 'nearDuplicates'}}]
  },
  {
    query   : 'nearDuplicates.similarityRate:desc:avg:{nested:{path: nearDuplicates}}'
              + '',
    expected: [{
      field : 'nearDuplicates.similarityRate',
      nested: {path: 'nearDuplicates'},
      mode  : 'avg',
      order : 'desc'
    }]
  },
  {
    query   : 'nearDuplicates.similarityRate: desc : AVG: { nested: {path: nearDuplicates}}',
    expected: [{
      field : 'nearDuplicates.similarityRate',
      nested: {path:'nearDuplicates'},
      mode  : 'avg',
      order : 'desc'
    }]
  },
  {
    query   : 'nearDuplicates.similarityRate:desc:avg:{nested:{path: nearDuplicates}} authorNames:min'
              + '',
    expected: [
      {
        field : 'nearDuplicates.similarityRate',
        nested: {path:'nearDuplicates'},
        mode  : 'avg',
        order : 'desc'
      },
      {
        field: 'authorNames',
        mode : 'min'
      }]
  },
  {
    query: 'authors.idConditor:{nested: { path: authors }}',
    expected: [
      {
        field: 'authors.idConditor',
        nested: {path: 'authors'}
      }
    ]
  }
];


describe('esSort: Grammar', () => {
  describe('parser#parse(sortQueryString)', () => {
    _.forEach(expectedAst, (test) => {
      describe(`"${test.query}"`, () => {
        it(test.message || 'Should return correct AST', () => {
          const ast = parser.parse(test.query);
          ast.should.deepEqual(test.expected);
        });
      });
    });
  });
});
