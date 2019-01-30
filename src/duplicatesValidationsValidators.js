'use strict';

const Joi = require('joi');
const idConditorSchema = Joi.string().token();

const validator = module.exports;


validator.schema = Joi.object()
                      .keys({
                              recordId     : idConditorSchema.required(),
                              duplicates   : Joi.array().items(idConditorSchema),
                              notDuplicates: Joi.array().items(idConditorSchema)
                            })
                      .or('duplicates', 'notDuplicates')
;

validator.validate = (duplicatesValidations) => {
  return Joi.validate(duplicatesValidations, validator.schema, {abortEarly: false});
};
