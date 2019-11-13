'use strict';

const
  _           = require('lodash'),
  trans       = require('./trans'),
  colors      = require('./myColors'), // jshint ignore:line
  packageJson = require('../package.json')
;


const appName = _.get(packageJson, 'name', 'myApp');

module.exports.logInfo = logInfo;
module.exports.logError = logError;
module.exports.logWarning = logWarning;
module.exports.logDebug = logDebug;
module.exports.logSuccess = logSuccess;

function logError (err) {
  const message = typeof err === 'string' ? arguments : [err.message, err];
  console.error('%s: [%s]: %s',
                appName.bold.danger,
                _getDate(),
                ...(_.map(message, trans))
  )
  ;
}

function logSuccess () {
  console.info('%s: [%s]:',
               appName.bold.success,
               _getDate(),
               ...(_.map(arguments, trans))
  );
}

function logInfo () {
  console.info('%s: [%s]:',
               appName.bold.info,
               _getDate(),
               ...(_.map(arguments, trans))
  );
}

function logWarning () {
  if (process.env.NODE_ENV === 'test') return;
  console.warn('%s: [%s]:',
               appName.bold.warning,
               _getDate(),
               ...(_.map(arguments, trans))
  );
}

function logDebug () {
  if (['test', 'production'].includes(process.env.NODE_ENV)) return;
  console.info('%s: [%s]:',
               appName.bold.primary,
               _getDate(),
               ...(_.map(arguments, trans))
  );
}

function _getDate () {
  return new Date(Date.now()).toLocaleString(undefined, {timeZoneName: 'short'});
}
