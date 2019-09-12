'use strict';

module.exports = notFoundHandler;

function notFoundHandler (req, res, next) {
  return next(routeNotFoundException(req.method, req.url));
}

function routeNotFoundException (method, url) {
  let err = new Error('routeNotFoundException');
  err.name = 'routeNotFoundException';
  err.status = 404;
  err.statusName = 'Not Found';
  err.details = `No route found for: ${method} ${url}`;
  return err;
}
