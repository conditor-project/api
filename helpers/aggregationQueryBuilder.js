'use strict';


const esb    = require('elastic-builder/src'),
      _      = require('lodash'),
      parser = require('./aggregationParser'),
      Joi    = require('joi')
;

const queryBuilder = module.exports;

queryBuilder.build = build;

const termsAggsSchema = Joi.object()
                           .keys({
                                   type                     : Joi.string().valid('terms').required(),
                                   field                    : Joi.string().required(),
                                   name                     : Joi.string(),
                                   size                     : Joi.number(),
                                   order                    : Joi.object()
                                                                 .length(1)
                                                                 .pattern(Joi.string(),
                                                                          Joi.string().valid(['asc', 'desc'])),
                                   show_term_doc_count_error: Joi.boolean(),
                                   minimum_doc_count        : Joi.number(),
                                   shard_size               : Joi.number(),
                                   missing                  : Joi.string(),
                                   include                  : [Joi.string(), Joi.array().items(Joi.string())],
                                   exclude                  : [Joi.string(), Joi.array().items(Joi.string())],
                                   aggs   : Joi.lazy(()=>{return schema;})
                                 })
;
let schema;
const range = Joi.object().keys({from: Joi.string().default('now'), to: Joi.string().default('now')});
const dateRangeAggsSchema = Joi.object().label('DATE')
                               .keys({
                                       type   : Joi.string().valid('date_range').required(),
                                       field  : Joi.string().required(),
                                       name   : Joi.string(),
                                       missing: Joi.string(),
                                       ranges : Joi.array().items(range).min(1),
                                       keyed  : Joi.boolean(),
                                       aggs   : Joi.lazy(()=>{return schema;})
                                     })
;

const bucketAggs = [termsAggsSchema, dateRangeAggsSchema];
const aggs = [].concat(bucketAggs);

 schema =  Joi.array().items(...aggs);

function build (aggsQuery) {
  const ast = parser.parse(aggsQuery);
  const validatedAst = Joi.attempt(ast, schema, {abortEarly: false});
  //console.dir(validatedAst, {depth: 10})

  return _buildAggs(validatedAst);
}

function _buildAggs (astArray) {
  return _.map(astArray, (agg) => {
    return _buildAgg(agg);
  });
}

function _buildAgg (agg) {
  if (agg.type === 'terms') {
    const name = agg.name ? agg.name : _.snakeCase(`${agg.field}_${agg.type}`).toUpperCase();
    const builder = esb.termsAggregation(name, agg.field);
    const options = _.omit(agg, ['type', 'field', 'name']);

    _(options)
      .mapValues((args, invokable) => {
                   return _adaptArgs(args, invokable);
                 }
      ).forEach((args, invokable) => {
      _.invoke(builder, _.camelCase(invokable), ...args);
    });

    return builder;
  }
  if (agg.type === 'date_range') {
    const name = agg.name ? agg.name : _.snakeCase(`${agg.field}_${agg.type}`).toUpperCase();
    const builder = esb.dateRangeAggregation(name, agg.field);
    const options = _.omit(agg, ['type', 'field', 'name']);


    options.format = 'yyy-MM-dd HH:mm:ss||yyy-MM-dd||yyy||epoch_millis';

    _(options)
      .mapValues((args, invokable) => {
                   return _adaptArgs(args, invokable);
                 }
      ).forEach((args, invokable) => {
      _.invoke(builder, _.camelCase(invokable), ...args);
    });
    return builder;
  }
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

