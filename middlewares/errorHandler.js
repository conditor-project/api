/* jshint -W098 */
'use strict';
const logger   = require('../helpers/logger'),
      logError = logger.logError
;
module.exports = errorHandler;

function errorHandler (err, req, res, next) {
  logError(err, err.stack, '\n');

  if (!res.headersSent) res.sendStatus(500);
}
