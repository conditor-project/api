'use strict';
const
  configComponent     = require('config-component'),
  config              = configComponent.get(module),
  {logInfo, logError} = require('../helpers/logger'),
  {validate}          = require('./configValidator'),
  semver              = require('semver'),
  smokeTest           = require('./smokeTest')
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
      return validate(config)
        .catch((error) => {
          logError('Config validation Error'.bold + '\n', error.annotate(process.env.NODE_ENV === 'production'));
          process.exit(1);
        });
    })
    .then(() => {
      Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;
      configComponent.view();
      logInfo('Application semver : ', config.app.version);
      logInfo('Application major semver : ', semver.major(config.app.version));
      logInfo(`Run ${'smoke test'.bold.warning}:`);
      return smokeTest
        .run()
        .then(()=>{
          logInfo(`Smoke test ${'succeded'.bold.success}`);
        })
        .catch((reason) => {
          logError(`Smoke test ${'failed'.bold.danger}: \n`, reason);
          process.exit(1);
        });

    })
    .catch((reason) => {
      logError(reason);
      process.exit(1);
    });
}
