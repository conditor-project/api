'use strict';

const Joi                   = require('joi'),
      {aggregation: config} = require('config-component').get(module)
;

let schema;

module.exports.getSchema = () => schema;

/**
 * Bucket Aggregations
 */
const nestedAggsSchema = Joi.object()
                            .keys({
                                    type: Joi.string().valid('nested').required(),
                                    path: Joi.string().required(),
                                    aggs: Joi.lazy(() => {return schema;})
                                  });

const termsAggsSchema = Joi.object()
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
                                   aggs                     : Joi.lazy(() => {return schema;})
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
                                       format : Joi.string()
                                                   .forbidden()
                                                   .default(
                                                     'yyy-MM-dd HH:mm:ss||strict_date_hour_minute_second||strict_date||strict_year||epoch_millis'),
                                       aggs   : Joi.lazy(() => {return schema;})
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

const bucketAggs = [termsAggsSchema, dateRangeAggsSchema, nestedAggsSchema];
const metricsAggs = [cardinalityAggsSchema];

const aggs = [].concat(bucketAggs, metricsAggs);

schema = Joi.array().items(...aggs);
