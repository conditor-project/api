'use strict';
const httpHeadersMapping              = require('../src/resultHandler').gethttpHeadersMapping(),
      {invokeMap}                     = require('lodash'),
      {express: {allowedAccessMethods}} = require('config-component').get(module)
;

const httpHeaderNames = invokeMap(httpHeadersMapping, 'name').join(', ');

module.exports = responseConfig;

function responseConfig (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization');
  res.header('Access-Control-Allow-Methods', allowedAccessMethods);
  res.header('Access-Control-Expose-Headers', httpHeaderNames);

  next();
}
