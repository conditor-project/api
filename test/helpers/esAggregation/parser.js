'use strict';

const parser = require('../../../helpers/esAggregation/parser'),
      should = require('should'), // jshint ignore:line
      _      = require('lodash')
;


const expectedAst = [
  {
    query   : 'terms:source',
    expected: [{type: 'terms', field: 'source'}]
  },
  {
    query   : 'terms:"élo$"',
    expected: [{type: 'terms', field: 'élo$'}],
    message : 'Should accept quoted string in field name'
  },
  {
    query   : 'date_range:creationDate:[]',
    expected: [{type: 'date_range', field: 'creationDate', ranges: [{}]}]
  },
  {
    query   : 'date_range:creationDate:[2014]',
    expected: [{type: 'date_range', field: 'creationDate', ranges: [{from: '2014'}]}]
  },
  {
    query   : 'date_range:publicationDate:[2000 to 2018]',
    expected: [{type: 'date_range', field: 'publicationDate', ranges: [{from: '2000', to: '2018'}]}]
  },
  {
    query   : 'date_range:publicationDate:[1996-05-12 to 2018-08-21]',
    expected: [{type: 'date_range', field: 'publicationDate', ranges: [{from: '1996-05-12', to: '2018-08-21'}]}]
  },
  {
    query   : 'date_range:publicationDate:[2000 to 2013-05-05][2013-05-05 to 2018][2018 to now]',
    message : 'Should accept multiple date range',
    expected: [{
      type  : 'date_range',
      field : 'publicationDate',
      ranges: [{from: '2000', to: '2013-05-05'}, {from: '2013-05-05', to: '2018'}, {from: '2018', to: 'now'}]
    }]
  },
  {
    query   : '(terms:source date_range:creationDate:[2018])',
    message : 'Should accept multiple aggregations',
    expected: [{type: 'terms', field: 'source'}, {type: 'date_range', field: 'creationDate', ranges: [{from: '2018'}]}]
  },
  {
    query   : 'terms:source date_range:creationDate:[2018] cardinality:first3AuthorNames.normalized',
    message : 'Should accept first level multiple aggregations without bracket',
    expected: [{
      type : 'terms',
      field: 'source'
    },
               {
                 type  : 'date_range',
                 field : 'creationDate',
                 ranges: [{from: '2018'}]
               },
               {
                 type : 'cardinality',
                 field: 'first3AuthorNames.normalized'
               }]
  },
  {
    query   : 'terms:source > (terms:hasDoi cardinality:doi.normalized)',
    message : 'Should accept multiple sub aggregations',
    expected: [{
      type : 'terms',
      field: 'source',
      aggs : [{type: 'terms', field: 'hasDoi'}, {type: 'cardinality', field: 'doi.normalized'}]
    }]
  },
  {
    query   : 'terms:source>terms:first3AuthorNames.normalized>cardinality:source:{name:sourceCount} date_range:creationDate:[2018] cardinality:first3AuthorNames.normalized',
    message : 'Should accept multiple sub aggregations',
    expected: [{
      type : 'terms',
      field: 'source',
      aggs : [{
        type : 'terms',
        field: 'first3AuthorNames.normalized',
        aggs : [{type: 'cardinality', field: 'source', name: 'sourceCount'}]
      }]
    },
               {
                 type  : 'date_range',
                 field : 'creationDate',
                 ranges: [{from: '2018'}]
               },
               {
                 type : 'cardinality',
                 field: 'first3AuthorNames.normalized'
               }]
  }
];

describe('esAggregation: Grammar', () => {
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


