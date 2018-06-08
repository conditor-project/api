'use strict';

const Joi    = require('joi'),
      semver = require('semver')
;

const configValidator = module.exports;

const customJoi = extend();

configValidator.validate = function(config) {
  return Joi.validate(config, configValidator.schema, {allowUnknown: true});
};

configValidator.schema = Joi.object()
                            .keys({
                                    app     : {version: customJoi.string().semver()},
                                    elastic : {clients: {main: {hosts: [Joi.array(), Joi.string(), Joi.object()]}}},
                                    security: {
                                      ip : {inMemory: [Joi.array()]},
                                      jwt: {secret: Joi.string().required(), algorithm: Joi.string().required()}
                                    }
                                  })
                            .requiredKeys('app','app.version')
;


function extend () {
  return Joi.extend((joi) => ({
    base    : joi.string(),
    name    : 'string',
    language: {
      semver: 'must be a valid semver'
    },
    rules   : [
      {
        name: 'semver',
        validate(params, value, state, options){
          return semver.valid(value) ? value : this.createError('string.semver', {v: value}, state, options);
        }
      }
    ]
  }));
}
