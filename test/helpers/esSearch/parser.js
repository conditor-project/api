'use strict';
/* eslint-env mocha */
const parser = require('../../../helpers/esSearch/parser');
const should = require('should'); // jshint ignore:line
const _ = require('lodash');

const expectedAst = [
  {
    query: '"documentType:ART"',
    expected: [{ queryString: 'documentType:ART' }]
  },
  {
    query: '"documentType:ART" author>name>"forename:rodrigo"',
    expected: [
      {
        queryString: 'documentType:ART'
      },
      {
        nestedPaths: ['author', 'name'],
        queryString: 'forename:rodrigo'
      }
    ]
  },
  {
    query: '"documentType:ART" author>name>"forename:rodrigo" title>"title.fr:(parthénogenese du poulpe)"',
    expected: [
      {
        queryString: 'documentType:ART'
      },
      {
        nestedPaths: ['author', 'name'],
        queryString: 'forename:rodrigo'
      },
      {
        nestedPaths: ['title'],
        queryString: 'title.fr:(parthénogenese du poulpe)'
      }
    ]
  },
  {
    query: '"documentType:ART" author>name>"forename:rodrigo" title>"title.fr:\\"parthénogenese du poulpe\\""',
    expected: [
      {
        queryString: 'documentType:ART'
      },
      {
        nestedPaths: ['author', 'name'],
        queryString: 'forename:rodrigo'
      },
      {
        nestedPaths: ['title'],
        queryString: 'title.fr:"parthénogenese du poulpe"'
      }
    ]
  }
];

describe('esSearch: Grammar', () => {
  describe('parser#parse(searchQueryString)', () => {
    _.forEach(expectedAst, (test) => {
      describe(test.query, () => {
        it(test.message || 'Should return correct AST', (done) => {
          try {
            const ast = parser.parse(test.query);
            ast.should.deepEqual(test.expected);
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });
});
