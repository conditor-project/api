'use strict';
const {logError}    = require('../helpers/logger'),
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
                            const url          = new URL(result.url),
                                  searchParams = _(result.query)
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

    result.url = protocol + '://' + path.join(res.req.get('host'), res.req.baseUrl, res.req.path);
    result.query = res.req.query;

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
  return (reason) => {
    let status = [400, 404].includes(reason.status) ? reason.status : 500;
    logError(reason);
    res.sendStatus(status);
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
