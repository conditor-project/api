'use strict';

const esb    = require('elastic-builder/src'),
      _      = require('lodash'),
      parser = require('./parser'),
      Joi    = require('joi')
  //,
      //schema = require('./validation').getSchema()
;

const queryBuilder = module.exports;

queryBuilder.build = build;

function build (sortQueryString) {
  const ast          = parser.parse(sortQueryString)
    //,
        //validatedAst = Joi.attempt(ast, schema)
         ;

        console.dir(ast);
  //return _buildAggs(validatedAst);
}
