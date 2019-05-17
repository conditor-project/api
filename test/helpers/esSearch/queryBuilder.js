'use strict';
/* eslint-env mocha */
const queryBuilder = require('../../../helpers/esSearch/queryBuilder');
const _ = require('lodash');
const should = require('should'); // jshint ignore:line

const queries = [
  {
    query: '"*"'
  },
  {
    query: 'brain'
  },
  {
    query: '"documentType:ART"'
  },
  {
    query: '"documentType:ART" authors>"authors.forename:rodrigo"'
  },
  {
    query: '"documentType:ART" authors>affiliations>"authors.affiliations.ref:*"'
  },
  {
    query: '"documentType:ART" "title.fr:(quick and brown)" authors>affiliations>"authors.affiliations.ref:*"'
  },
  {
    query: `"documentType:ART" 'title.fr:"parthenogenese du poulpe"' authors>affiliations>"authors.affiliations.ref:*"`
  },
  {
    query: '"city.\*:(this AND that OR thus)"'
  },
  {
    query: '"name:/joh?n(ath[oa]n)/"'
  },
  {
    query: '"quikc~ brwn~ foks~"'
  },
  {
    query: '"count:[1 TO 5}"'
  },
  {
    query: '"quick^2 fox"'
  },
  {
    query: '"status:(active OR pending) title:(full text search)^2"'
  }
];

describe('esSort: ', () => {
  describe('queryBuilder#build(searchQueryString)', () => {
    _.forEach(queries, ({ query, message }) => {
      describe(query, () => {
        it(message || 'Should build esSearchQuery without throwing', () => {
          queryBuilder.build(query);
        });
      });
    });
  });
});
