'use strict';
const
  configComponent     = require('config-component'),
  config              = configComponent.get(),
  {logInfo, logError} = require('../helpers/logger'),
  Joi                 = require('joi'),
  configSchema        = require('./configSchema')
;

exports.setup = setup;

// all action taken before application starts
function setup () {

  return Promise
    .resolve()
    .then(() => {
      process.on('unhandledRejection', (reason, p) => {
        logError('Unhandled Rejection at:', p, 'reason:', reason);
      });
    })
    .then(() => {
      return Joi.validate(config, configSchema, {allowUnknown: true});
    })
    .then(() => {
      Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;
      configComponent.view();
    })
    .catch((reason) => {
      logError(reason);
      process.exit(1);
    });
}
