'use strict';
const {express: {allowedAccessMethods}} = require('config-component').get(module);

module.exports = httpMethodsHandler;

function httpMethodsHandler (req, res, next) {
  if (req.method === 'OPTIONS') {
    // End CORS preflight request.
    return res
      .status(204)
      .end();

  }

  if (!allowedAccessMethods.includes(req.method)) {
    return res
      .status(405)
      .end();
  }

  next();
}
