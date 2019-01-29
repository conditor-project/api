/* jshint -W098 */
'use strict';
const {logError}           = require('../helpers/logger'),
      {getErrorHandler} = require('../src/resultHandler')
;
module.exports = errorHandler;

function errorHandler (err, req, res, next) {
  getErrorHandler(res)(err);
}
