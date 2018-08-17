'use strict';

const queryBuilder     = require('../../helpers/queryBuilder'),
      should           = require('should'), // jshint ignore:line
      recordsManager   = require('../../src/manager/recordsManager'),
      {main: esClient} = require('../../helpers/clients/elastic').startAll().get(),
      esb              = require('elastic-builder/src')
;

//should.noConflict(); // bodybuilder has its own should function

const q= "title:a* AND source:hal^2 -wos OR title:/bob.*/ AND size:(>=20 <100)"


describe.skip('queryBuilder', function() {
  describe('#filter(luceneQuery)', function() {
    it('Should return searchBody', function() {
      const expectedQuery = {
              query: {
                bool: {
                  filter: {
                    term: {
                      source         : 'wos',
                      publicationYear: '2014'
                    }
                  }
                }
              }
            },
            luceneQuery   = q,
            query         = queryBuilder.filter(luceneQuery);
      console.dir(query, {depth: 10});

      should(query).deepEqual(expectedQuery);
    });
  });
});

describe.skip('recordsManager', function() {
  describe('#searchRecords', function() {
    it('Should return results set for given lucene query', function(done) {
      const luceneQuery = 'source:wos';

      recordsManager
        .searchRecords(luceneQuery)
        .then((response) => {
          should(response.result.length).equal(10);
          done();
        })
        .catch(done);
    });
  });
});
