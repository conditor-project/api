'use strict';

const Joi                   = require('@hapi/joi'),
      {aggregation: config} = require('config-component').get(module),
      _                     = require('lodash')
;

module.exports.validate = validate;

/**
 * Bucket Aggregations
 */
const globalAggsSchema = Joi.object()
                            .keys(
                              {
                                type: Joi.string().valid('global').required(),
                                name: Joi.string(),
                                aggs: _getSubAggsSchema()
                              }
                            )
;

const nestedAggsSchema = Joi.object()
                            .keys({
                                    type : Joi.string().valid('nested').required(),
                                    path : Joi.string().required(),
                                    aggs : _getSubAggsSchema(),
                                    field: Joi.forbidden().default(Joi.ref('path')),
                                    name : Joi.string()
                                  });

const termsAggsSchema = Joi.object().label('Terms aggregation')
                           .keys({
                                   type                     : Joi.string().valid('terms').required(),
                                   field                    : Joi.string()
                                                                 .required()
                                                                 .invalid(config.bucket.terms.invalidFields),
                                   name                     : Joi.string(),
                                   size                     : Joi.number().max(config.bucket.terms.maxSize),
                                   order                    : Joi.object()
                                                                 .length(1)
                                                                 .pattern(Joi.string(),
                                                                          Joi.string().valid(['asc', 'desc'])),
                                   show_term_doc_count_error: Joi.boolean(),
                                   min_doc_count            : Joi.number(),
                                   shard_size               : Joi.number(),
                                   missing                  : Joi.string(),
                                   include                  : [Joi.string(), Joi.array().items(Joi.string())],
                                   exclude                  : [Joi.string(), Joi.array().items(Joi.string())],
                                   aggs                     : _getSubAggsSchema()
                                 })
;

const range = Joi.object().keys({from: Joi.string().default('now'), to: Joi.string().default('now')});

const dateRangeAggsSchema = Joi.object()
                               .keys({
                                       type   : Joi.string().valid('date_range').required(),
                                       field  : Joi.string().required(),
                                       name   : Joi.string(),
                                       missing: Joi.string(),
                                       ranges : Joi.array().items(range).min(1),
                                       keyed  : Joi.boolean(),
                                       format : Joi.forbidden()
                                                   .default(
                                                     'yyy-MM-dd HH:mm:ss||strict_date_hour_minute_second||strict_date||strict_year||epoch_millis'),
                                       aggs   : _getSubAggsSchema()
                                     })
;
/*
 * Metrics Aggregations
 */
const cardinalityAggsSchema = Joi.object()
                                 .keys({
                                         type               : Joi.string().valid('cardinality').required(),
                                         field              : Joi.string().required(),
                                         name               : Joi.string(),
                                         precision_threshold: Joi.number(),
                                         missing            : Joi.string()
                                       })
;

const bucketAggs = {termsAggsSchema, dateRangeAggsSchema, nestedAggsSchema, globalAggsSchema};
const metricsAggs = {cardinalityAggsSchema};
const allAggs = Object.assign(bucketAggs, metricsAggs);
const subAggs = Object.assign(bucketAggs, metricsAggs); // Only bucket aggregations can have sub-aggregations, of types bucket and metrics

const aggsSchema = Joi.array().items(_buildAggsAlternatives(allAggs));

function _getSubAggsSchema () {
  return Joi.lazy(() => {return Joi.array().items(_buildAggsAlternatives(subAggs));},
                  {once: true});
}


function _buildAggsAlternatives (aggs) {
  return _.reduce(aggs,
                     (alternatives, aggSchema) => {
                       const name = Joi.reach(aggSchema, 'type').describe().valids[0];
                       return alternatives.when(Joi.object().keys({type: Joi.string().valid(name)}).unknown(true),
                                                {then: aggSchema});
                     },
                     Joi.alternatives()
  );
}


function validate (aggsAst, options = {abortEarly: true}) {
  const validatedValues = Joi.validate(aggsAst, aggsSchema, options);
  if (_.get(validatedValues, 'error')) throw validatedValues.error;

  return validatedValues.value;
}
