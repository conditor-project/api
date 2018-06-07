'use strict';
const {logError, logInfo} = require('../helpers/logger'),
      _                   = require('lodash'),
      {constant}          = require('lodash'),
      {app}               = require('config-component').get()
;

exports.getResultHandler = _getResultHandler;
exports.getSingleResultErrorHandler = _getSingleResultErrorHandler;
exports.getErrorHandler = _getErrorHandler;

const httpHeadersMapping = {
  scrollId       : {name: constant('Scroll-Id')},
  totalCount     : {name: constant('X-Total-Count')},
  resultCount    : {name: constant('X-Result-Count')},
  _invalidOptions: {
    name : constant('Warning'),
    value: invalidParametersWarning
  }
};

function _getResultHandler (res) {
  return (result) => {
    _.forOwn(result, (value, key) => {
      if (_.has(httpHeadersMapping, key) && !_.isNil(value) && !(_.isArrayLikeObject(value) && _.isEmpty(value))) {
        res.set(
          httpHeadersMapping[key].name(),
          _.invoke(httpHeadersMapping, `${key}.value`, value) || value
        );
      }
    });

    return result;
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

function invalidParametersWarning (invalidFields) {
  // @See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Warning
  const warnCode  = 199,
        warnAgent = app.name,
        warnText  = `Invalid URL parameters: ${invalidFields}`;

  return `${warnCode} ${warnAgent} "${warnText}"`;
}
