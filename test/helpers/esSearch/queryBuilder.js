'use strict';
/* eslint-env mocha */
const queryBuilder = require('../../../helpers/esSearch/queryBuilder');
const _ = require('lodash');
const should = require('should'); // jshint ignore:line

const queries = [
  {
    query: '"documentType:ART" authors>affiliations>"authors.affiliations.ref:*"'
  }
];

describe('esSort: ', () => {
  describe('queryBuilder#build(searchQueryString)', () => {
    _.forEach(queries, ({ query, message }) => {
      describe(query, () => {
        it(message || 'Should build esSearchQuery without throwing', () => {
          const result = queryBuilder.build(query);
          console.dir(result.map(item => item.toJSON()), { depth: 16 });
        });
      });
    });
  });
});
