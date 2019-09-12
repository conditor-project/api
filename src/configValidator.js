'use strict';

const Joi    = require('@hapi/joi'),
      semver = require('semver')
;

const configValidator = {};

module.exports = configValidator;

const customJoi = _extend();
const ipUser = Joi.object()
                  .keys({
                          ip   : Joi.string().ip({version: ['ipv4'], cidr: 'forbidden'}),
                          email: Joi.string().email()
                        });

configValidator.validate = function(config) {
  return Joi.validate(config, configValidator.schema, {allowUnknown: true, presence: 'required', abortEarly: false});
};

configValidator.schema = Joi.object()
                            .keys({
                                    app         : {
                                      version                   : customJoi.string().semver(),
                                      doExitOnUnhandledRejection: Joi.boolean()
                                    },
                                    elastic     : {
                                      queryString: {
                                        allowLeadingWildcard : Joi.boolean().optional(),
                                        maxDeterminizedStates: Joi.number().optional()
                                      },
                                      clients    : {
                                        main: {
                                          hosts: [Joi.array(), Joi.string(), Joi.object()]
                                        }
                                      }
                                    },
                                    express     : {
                                      allowedAccessMethods: Joi.array()
                                    },
                                    security    : {
                                      ip : {
                                        inMemory: Joi.array().items(ipUser).optional()
                                      },
                                      jwt: {
                                        secret   : Joi.string(),
                                        algorithm: Joi.string()
                                      }
                                    },
                                    sourceIdsMap: Joi.object(),
                                    indices     : Joi.object().keys({
                                                                      records: {
                                                                        index   : Joi.string(),
                                                                        type    : Joi.string(),
                                                                        excludes: Joi.array().optional(),
                                                                        optional: Joi.boolean().optional()
                                                                      }
                                                                    })
                                  })
                            .optionalKeys('security.ip')
;


function _extend () {
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
