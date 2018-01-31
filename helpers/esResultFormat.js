'use strict';

const _               = require('lodash'),
      responseBuilder = {}
;


module.exports = responseBuilder;

responseBuilder.getSingleHit = (body) => {
  return body;
  return _.get(body, 'hits.hits.0', null);
};
