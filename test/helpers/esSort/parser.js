'use strict';

const parser = require('../../../helpers/esSort/parser'),
      should = require('should'), // jshint ignore:line
      _      = require('lodash')
;

const expectedAst = [
  {
    query   : '',
    expected: [{field: ''}]
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
    query   : 'nearDuplicate.similarityRate:{nested:nearDuplicate}',
    expected: [{field: 'nearDuplicate.similarityRate', nested: 'nearDuplicate'}]
  },
  {
    query   : 'nearDuplicate.similarityRate:desc:avg:{nested:nearDuplicate}',
    expected: [{
      field : 'nearDuplicate.similarityRate',
      nested: 'nearDuplicate',
      mode  : 'avg',
      order: 'desc'
    }]
  },
  {
    query   : 'nearDuplicate.similarityRate: desc : AVG: { nested: '
              + 'nearDuplicate}',
    expected: [{
      field : 'nearDuplicate.similarityRate',
      nested: 'nearDuplicate',
      mode  : 'avg',
      order: 'desc'
    }]
  }
];


describe('esSort', () => {
  describe('parser#parse(aggsQuery)', () => {
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
