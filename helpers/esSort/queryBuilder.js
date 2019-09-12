'use strict';

const esb    = require('elastic-builder/src'),
      _      = require('lodash'),
      parser = require('./parser'),
      Joi    = require('@hapi/joi'),
      schema = require('./validation').getSchema()
;

const queryBuilder = module.exports;

queryBuilder.build = build;

function build (sortQueryString) {
  const ast          = parser.parse(sortQueryString),
        validatedAst = Joi.attempt(ast, schema)
  ;

  return _buildSorts(validatedAst);
}


function _buildSorts (astArray) {
  return _.map(astArray, _buildSort);
}

function _buildSort ({field, order, ...sort}) {
  const builder = esb.sort(field, order);

  _(sort)
    .mapValues((args, invokable) => {
      return _adaptArgs(args, invokable);
    })
    .forEach((args, invokable) => {
      _.invoke(builder, _.camelCase(invokable), ...args);
    })
  ;

  return builder;
}

const argsMapping = {
  default: {adapt: (args) => {return [args];}}
};

function _adaptArgs (args, invokable) {
  if (!_.has(argsMapping, invokable)) return argsMapping.default.adapt(args);
  return argsMapping[invokable].adapt(args);
}
