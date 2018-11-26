'use strict';
const httpHeadersMapping = require('../src/resultHandler').gethttpHeadersMapping(),
      {invokeMap}              = require('lodash')
;

const httpHeadersNames = invokeMap(httpHeadersMapping, 'name').join(', ');

module.exports = responseConfig;

function responseConfig (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Expose-Headers', httpHeadersNames);

  next();
}
