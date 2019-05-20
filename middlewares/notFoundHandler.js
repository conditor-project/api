'use strict';

module.exports = notFoundHandler;

function notFoundHandler (req, res) {
  res.status(404).json({
                         errors: [{
                           status    : 404,
                           statusName: 'Not Found',
                           message   : `No route found for: ${req.method} ${req.url}`
                         }]
                       });
}
