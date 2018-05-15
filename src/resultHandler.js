'use strict';
const {logError, logInfo} = require('../helpers/logger'),
      _                   = require('lodash')
;

exports.getResultHandler = _getResultHandler;
exports.getSingleResultErrorHandler = _getSingleResultErrorHandler;
exports.getErrorHandler = _getErrorHandler;

function _getResultHandler (res) {
  return ({result, resultCount, totalCount, scrollId, ...rest}) => {
    scrollId && res.set('Scroll-Id', scrollId);
    res.set('X-Total-Count', totalCount);
    res.set('X-Result-Count', resultCount);

    return _.assign({result, resultCount, totalCount, scrollId}, rest);
  };
}

function _getSingleResultErrorHandler (res) {
  return (err) => {
    if (err.name === 'NoResultException') return res.sendStatus(404);
    if (err.name === 'NonUniqueResultException') return res.sendStatus(300);
    throw(err);
  };
}

function _getErrorHandler (res) {
  return (reason) => {
    let status = [400, 404].includes(reason.status) ? reason.status : 500;
    logError(reason);
    res.sendStatus(status);
  };
}
