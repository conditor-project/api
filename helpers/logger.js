'use strict';

const
  _      = require('lodash'),
  trans  = require('./trans'),
  colors = require('./myColors') // jshint ignore:line
;

module.exports.logInfo = logInfo;
module.exports.logError = logError;
module.exports.logWarning = logWarning;

function logError (err) {
  const message = typeof err === 'string' ? arguments : [err.message, err];
  console.error('%s: [%s]: %s',
                'Conditor-api'.bold.danger,
                new Date(Date.now()).toLocaleString(),
                ...(_.map(message, trans))
  )
  ;
}

function logInfo () {
  console.info('%s: [%s]:',
               'Conditor-api'.bold.info,
               new Date(Date.now()).toLocaleString(),
               ...(_.map(arguments, trans))
  );
}

function logWarning () {
  console.warn('%s: [%s]:',
               'Conditor-api'.bold.warning,
               new Date(Date.now()).toLocaleString(),
               ...(_.map(arguments, trans))
  );
}
