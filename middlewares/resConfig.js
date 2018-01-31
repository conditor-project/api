'use strict';

module.exports = responseConfig;

function responseConfig(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');

  next();
}
