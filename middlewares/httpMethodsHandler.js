'use strict';

module.exports = httpMethodsHandler;

function httpMethodsHandler (req, res, next) {
  const allowedHttpMethods = ['GET', 'OPTIONS'];

  if (req.method === 'OPTIONS') {
    // End CORS preflight request.
    return res
      .status(204)
      .end();

  }

  if (!allowedHttpMethods.includes(req.method)) {
    return res
      .status(405)
      .end();
  }

  next();
}
