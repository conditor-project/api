'use strict';

const config                 = require('config-component').get(module),
      {validate}             = require('../src/configValidator'),
      {logSuccess, logError} = require('../helpers/logger')
;

validate(config)
  .then(() => {
    logSuccess('Config validation confirmed'.success);
  })
  .catch((error) => {
    if (!error.isJoi) return logError(error);
    logError('Config validation Error'.bold + '\n', error.annotate());
  })
;


