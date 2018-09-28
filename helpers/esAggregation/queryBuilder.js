'use strict';


const esb    = require('elastic-builder/src'),
      _      = require('lodash'),
      parser = require('./parser'),
      Joi    = require('joi'),
      schema = require('./validation').getSchema()
;

const queryBuilder = module.exports;

queryBuilder.build = build;

function build (aggsQuery) {
  const ast          = parser.parse(aggsQuery),
        validatedAst = Joi.attempt(ast, schema);
  return _buildAggs(validatedAst);
}

function _buildAggs (astArray) {
  return _.map(astArray, _buildAgg);
}

function _buildAgg (agg, index = 0, collection = []) {

  const builderName = `${_.camelCase(agg.type)}Aggregation`,
        name        = _computeAggName(agg, index, collection),
        builder     = esb[builderName](name, agg.field),
        options     = _.omit(agg, ['type', 'field', 'name']);

  _(options)
    .mapValues((args, invokable) => {
      return _adaptArgs(args, invokable);
    })
    .forEach((args, invokable) => {
      _.invoke(builder, _.camelCase(invokable), ...args);
    });

  return builder;
}

function _computeAggName (agg, index, collection) {
  if (agg.name) return agg.name;

  const hasNameCollision = collection.length > 1
                           && _.find(collection, {'type': agg.type, 'field': agg.field}) !== agg;
  return _buildAggName(agg.type, agg.field, hasNameCollision ? index : null);
}

function _buildAggName (type, field, namePostfix = null) {
  const tokens = [_.snakeCase(type), field];
  if (namePostfix !== null) tokens.push(namePostfix);

  return tokens.join('_')
               .toUpperCase();
}

const argsMapping = {
  default: {adapt: (args) => {return [args];}},
  order  : {adapt: (args) => {return _.toPairs(args)[0];}},
  aggs   : {adapt: (args) => {return [_buildAggs(args)];}}
};

function _adaptArgs (args, invokable) {
  if (!_.has(argsMapping, invokable)) return argsMapping.default.adapt(args);
  return argsMapping[invokable].adapt(args);
}

