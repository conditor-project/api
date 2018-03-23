'use strict';
const configComponent = require('config-component'),
      logger          = require('../helpers/logger'),
      logInfo         = logger.logInfo,
      logError        = logger.logError,
      config = require('config-component').get()
;


exports.setup = setup;

// all action taken before application starts
function setup () {

  return Promise
    .resolve()
    .then(() => {
      Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

      process.on('unhandledRejection', (reason, p) => {
        logError('Unhandled Rejection at:', p, 'reason:', reason);
      });

      configComponent.view();
    });
}
