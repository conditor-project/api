'use strict';
const {logError}             = require('../helpers/logger'),
      _                      = require('lodash'),
      {constant}             = require('lodash'),
      {app}                  = require('config-component').get(module),
      formatter              = require('format-link-header'),
      path                   = require('path'),
      {URL, URLSearchParams} = require('url')
;

exports.getResultHandler = getResultHandler;
exports.getSingleResultErrorHandler = getSingleResultErrorHandler;
exports.getErrorHandler = getErrorHandler;
exports.gethttpHeadersMapping = () => httpHeadersMapping;

const httpHeadersMapping = {
  scrollId   : {name: constant('Scroll-Id')},
  totalCount : {name: constant('X-Total-Count')},
  resultCount: {name: constant('X-Result-Count')},
  _warnings  : {
    name : constant('Warning'),
    value: _headerWarningBuilder
  },
  links      : {
    name : constant('Link'),
    value: (links, key, result) => {
      links = _.mapValues(links,
                          (link) => {
                            const url          = new URL(result._url),
                                  searchParams = _(result._query)
                                    .omit(['page', 'page_size'])
                                    .set('page', link.page)
                                    .set('page_size', link.page_size)
                                    .value(),
                                  search       = new URLSearchParams(searchParams)
                            ;
                            url.search = search;
                            link.url = url.toString();
                            return link;
                          });

      return formatter(links);
    }
  }
};

function getResultHandler (res) {
  return (result) => {
    if (_.has(res, 'locals.invalidOptions')) {
      result.addWarning({text: `Invalid URL parameters: ${res.locals.invalidOptions}`});
    }

    // INIST reverse proxy doesn't forward protocol, so we try to guess.
    const protocol = (new URL(res.req.protocol + '://' + res.req.get('host'))).port === '' ? 'https' : 'http';

    result._url = protocol + '://' + path.join(res.req.get('host'), res.req.baseUrl, res.req.path);
    result._query = res.locals.validatedQuery;

    _.forEach(result, (value, key) => {
      if (_.has(httpHeadersMapping, key) && !_.isNil(value) && !(_.isArrayLikeObject(value) && _.isEmpty(value))) {
        res.set(
          httpHeadersMapping[key].name(),
          _.invoke(httpHeadersMapping, `${key}.value`, value, key, result) || value
        );
      }
    });

    res.status(_.get(result, 'status', 200));

    return result;
  };
}

function getSingleResultErrorHandler (res) {
  return (err) => {
    if (err.name === 'NoResultException') return res.sendStatus(404);
    if (err.name === 'NonUniqueResultException') return res.sendStatus(300);
    throw(err);
  };
}

function getErrorHandler (res) {
  return (err) => {
    const status = [400, 409, 404].includes(err.status) ? err.status : 500;
    if (status === 500) logError(err);

    if (res.headersSent) return;

    if (_.has(res, 'req.query.debug') && res.req.query.debug !== 'false' && String(status).startsWith('4')) {
      return res.status(status).send(_format4xxResponse(err, res.locals));
    }
    res.sendStatus(status);
  };
}
const errorMessagesMapping = [
        {
          predicate: (reason) => reason.isPeg,
          label    : (reason) => reason.label,
          message  : (reason) => reason.message
        },
        {
          predicate: (reason) => reason.isJoi,
          iterateOn: 'details',
          message  : (reason, i = 0) => _.get(reason, `details.${i}.message`,'').replace(/"/gm,'\''),
          details  : (reason, i = 0) => {
            const value = _.get(reason, `details.${i}.context.value`);
            return `got (${typeof value}) ${_.isObject(value) ? JSON.stringify(value) : value}`.replace(/"/gm,'\'');
          },
          label    : (reason, i = 0) => _.get(reason, `details.${i}.context.label`)
        },
        {
          predicate: (reason) => {return _(reason).keys().intersection(['body', 'response']).size() === 2;},
          message  : (reason) => _.get(reason, 'body.error.root_cause.0.reason')
        },
        {
          predicate: reason => reason.name === 'SequelizeUniqueConstraintError'
                               && _.get(reason, 'original.table') === 'DuplicatesValidations',
          name     : () => 'Unique constaint error',
          message  : () => `Duplicates already validated`,
          details  : (reason) => [_.invoke(reason, 'errors.0.instance.getInitialSourceUid'),
                                  _.invoke(reason, 'errors.0.instance.getTargetSourceUid')]
        }

      ]
;

const statusNamesMapping = {
  400: 'Bad Request',
  409: 'Conflict',
  404: 'Not Found'
  /* add others if needed */
};

function _format4xxResponse (reason, {invalidOptions = [], ...resLocals} = {}) {
  const mapping = _.find(errorMessagesMapping, ({predicate}) => predicate(reason));
  const errors = [];


  if (mapping && mapping.iterateOn) {
    _.chain(reason)
     .get(mapping.iterateOn)
     .each((value, index) => {
       errors.push(
         _buildError(mapping, reason, index)
       );
     })
     .value();
  } else {
    errors.push(_buildError(mapping, reason));
  }
  const errorResponse = {
    errors: errors
  };

  if (invalidOptions.length) {
    errorResponse.warnings = [{
      name   : 'Invalid URL parameters',
      details: invalidOptions
    }];
  }
  return errorResponse;
}

function _buildError (mapping, reason, index) {
  return {
    status    : reason.status,
    statusName: _.get(statusNamesMapping, reason.status),
    name      : _.invoke(mapping, 'name', reason, index) || reason.name,
    label     : _.invoke(mapping, 'label', reason, index),
    message   : _.invoke(mapping, 'message', reason, index) || reason.message,
    details   : _.invoke(mapping, 'details', reason, index) || reason.details
  };
}

function _headerWarningBuilder (warnings) {
  return _(warnings)
    .transform(
      (accu, warn) => {
        accu.push(`${warn.code || 199} ${app.name} "${warn.text}"`);
      })
    .join(',')
    ;
}
