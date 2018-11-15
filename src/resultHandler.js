'use strict';
const {logError, logInfo}    = require('../helpers/logger'),
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

const httpHeadersMapping = {
  scrollId       : {name: constant('Scroll-Id')},
  totalCount     : {name: constant('X-Total-Count')},
  resultCount    : {name: constant('X-Result-Count')},
  _invalidOptions: {
    name : constant('Warning'),
    value: _invalidParametersWarning
  },
  links          : {
    name : constant('link'),
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

    result._invalidOptions = res.locals.invalidOptions;
    result.url = res.req.protocol + '://' + path.join(res.req.get('host'), res.req.baseUrl, res.req.path);
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

function _invalidParametersWarning (invalidFields) {
  // @See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Warning
  const warnCode  = 199,
        warnAgent = app.name,
        warnText  = `Invalid URL parameters: ${invalidFields}`;

  return `${warnCode} ${warnAgent} "${warnText}"`;
}
