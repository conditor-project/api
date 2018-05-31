'use strict';
const
  configComponent     = require('config-component'),
  config              = configComponent.get(),
  {logInfo, logError} = require('../helpers/logger'),
  {validate}        = require('./configValidator'),
  semver              = require('semver')
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
      return validate(config);
    })
    .then(() => {
      Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;
      configComponent.view();
      logInfo('Application semver : ', config.app.version);
      logInfo('Application major semver : ', semver.major(config.app.version));
    })
    .catch((reason) => {
      logError(reason);
      process.exit(1);
    });
}
