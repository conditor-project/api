'use strict';

const Joi = require('@hapi/joi')
;

const validator = module.exports;


validator.schema = Joi.number().max(90).min(1);


validator.validate = (value) => {
  return Joi.validate(value, validator.schema, {abortEarly: true});
};

validator.assert = (value, message) => {
  return Joi.attempt(value, validator.schema, message);
};
