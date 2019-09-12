'use strict';


const esb          = require('elastic-builder/src'),
      _            = require('lodash'),
      parser       = require('./parser'),
      {validate} = require('./validation')
;

const queryBuilder = module.exports;

queryBuilder.build = build;

function build (aggsQueryString) {
  const ast          = parser.parse(aggsQueryString),
        validatedAst = validate(ast, {abortEarly:false})
  ;

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
                           && _(collection).filter({'type': agg.type, 'field': agg.field}).size() > 1;

  return _buildAggName(agg.type, agg.field, hasNameCollision ? index.toString() : null);
}

function _buildAggName (type, field, namePostfix = null) {
  const tokens = [_.snakeCase(type), _.snakeCase(field), namePostfix];

  return _.compact(tokens)
          .join('_')
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

