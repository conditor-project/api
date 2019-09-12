'use strict';

const Joi    = require('@hapi/joi')
;

let schema;

module.exports.getSchema = () => schema;


const sortSchema = Joi.object()
                      .keys({
                             field        : Joi.string().required(),
                              order        : Joi.string().valid('asc', 'desc'),
                              mode         : Joi.string().valid('min', 'max', 'sum', 'avg', 'median'),
                              missing      : Joi.string(),
                              unmapped_type: Joi.string(),
                              nested       : Joi.lazy(() => nested)
                            }).label('Sort');

const nested = Joi.object()
                  .keys({
                          path        : Joi.string().required(),
                          //filter       : Joi.object(), // @Todo add filterQueryBuilder
                          nested      : Joi.lazy(() => nested)
                        });

schema = Joi.array().items(sortSchema);
