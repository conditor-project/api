'use strict';

const config     = require('config-component').get(),
      {validate} = require('../src/configValidator'),
      {logInfo, logError} = require('../helpers/logger')
;

validate(config)
  .then(()=>{
    logInfo('Config validation confirmed');
  })
  .catch(logError)
;


