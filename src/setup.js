'use strict';
const
  configComponent     = require('config-component'),
  config              = configComponent.get(module),
  {logInfo, logError} = require('../helpers/logger'),
  {validate}          = require('./configValidator'),
  semver              = require('semver'),
  smokeTest           = require('./smokeTest'),
  state               = require('../helpers/state'),
  indexManager        = require('./manager/indexManager')
;

exports.setup = setup;

// all action taken before application starts
function setup () {
  return Promise
    .resolve()
    .then(() => {
      process.on('unhandledRejection', (reason, p) => {
        logError('Unhandled Rejection at:', p, 'reason:', reason);
        if (config.app.doExitOnUnhandledRejection) {
          process.exit(1);
        }
      });
      return indexManager
        .getSettings(config.indices.records.index, 'index.max_result_window')
        .then((settings) => {
          state.set('indices.records.cachedSettings.maxResultWindow', settings.max_result_window);
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
      logInfo('Application semver : ', config.app.version);
      logInfo('Application major semver : ', semver.major(config.app.version));

      if (!config.smokeTest.doRun) return;
      logInfo(`${'Smoke test'.bold} : ${'run'.bold.warning}`);

      return smokeTest
        .run()
        .then(() => {
          logInfo(`${'Smoke test'.bold} :  ${'succeded'.bold.success}`);
        })
        .catch((reason) => {
          logError(`${'Smoke test'.bold} : ${'failed'.bold.danger}: \n`, reason);
          process.exit(1);
        });

    })
    .catch((reason) => {
      logError(reason);
      process.exit(1);
    });
}
