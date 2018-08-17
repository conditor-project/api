'use strict';

const Joi    = require('joi'),
      semver = require('semver')
;

const configValidator = module.exports;

const customJoi = extend();

configValidator.validate = function(config) {
  return Joi.validate(config, configValidator.schema, {allowUnknown: true, presence: 'required', abortEarly: false});
};

configValidator.schema = Joi.object(
                            )
                            .keys({
                                    app     : {
                                      version: customJoi.string().semver()
                                    },
                                    elastic : {
                                      queryString: {
                                        allowLeadingWildcard: Joi.boolean().optional(),
                                        maxDeterminizedStates: Joi.number().optional()
                                      },
                                      clients    : {
                                        main: {
                                          hosts: [Joi.array(), Joi.string(), Joi.object()]
                                        }
                                      }
                                    },
                                    security: {
                                      ip : {
                                        inMemory: Joi.array().optional()
                                      },
                                      jwt: {
                                        secret   : Joi.string(),
                                        algorithm: Joi.string()
                                      }
                                    }
                                  })
                            .optionalKeys('security.ip')
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
