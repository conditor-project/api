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
    query   : 'nearDuplicate.similarityRate:{nested:{path: nearDuplicate}}',
    expected: [{field: 'nearDuplicate.similarityRate', nested: {path: 'nearDuplicate'}}]
  },
  {
    query   : 'nearDuplicate.similarityRate:desc:avg:{nested:{path: nearDuplicate}}'
              + '',
    expected: [{
      field : 'nearDuplicate.similarityRate',
      nested: {path: 'nearDuplicate'},
      mode  : 'avg',
      order : 'desc'
    }]
  },
  {
    query   : 'nearDuplicate.similarityRate: desc : AVG: { nested: {path: nearDuplicate}}',
    expected: [{
      field : 'nearDuplicate.similarityRate',
      nested: {path:'nearDuplicate'},
      mode  : 'avg',
      order : 'desc'
    }]
  },
  {
    query   : 'nearDuplicate.similarityRate:desc:avg:{nested:{path: nearDuplicate}} authorNames:min'
              + '',
    expected: [
      {
        field : 'nearDuplicate.similarityRate',
        nested: {path:'nearDuplicate'},
        mode  : 'avg',
        order : 'desc'
      },
      {
        field: 'authorNames',
        mode : 'min'
      }]
  },
  {
    query: 'authorRef.idConditor:{nested: { path: authorRef }}',
    expected: [
      {
        field: 'authorRef.idConditor',
        nested: {path: 'authorRef'}
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
