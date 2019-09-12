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
    if (error.isJoi) {
      logError('Config validation Error'.bold + '\n',
               error.annotate(process.env.NODE_ENV === 'production'));
    }
    else { logError(error);}

    process.exit(1);
  })
;


