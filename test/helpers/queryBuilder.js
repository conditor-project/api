'use strict';

const queryBuilder = require('../../helpers/queryBuilder')
;

describe('queryBuilder', function(){
  describe('#filter(luceneQuery)', function(){
    it('Should return searchBody', function(){
      queryBuilder.filter('source:wos');
    });
  });
});
