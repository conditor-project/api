'use strict';

const config              = require('config-component').get(module),
      {validate}          = require('../src/configValidator'),
      {logInfo, logError} = require('../helpers/logger')
;

validate(config)
  .then(() => {
    logInfo('Config validation confirmed');
  })
  .catch((error) => { logError('Config validation Error'.bold + '\n', error.annotate());})
;


