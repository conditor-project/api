/* jshint -W098 */
'use strict';

module.exports = errorHandler;

function errorHandler (err, req, res, next) {
  console.error(err, err.stack, '\n');
  let errorResponse =

        {
          'status' : 500,
          'message': 'Erreur interne du serveur'
        }
  ;

  res.status(500).send(errorResponse);
}
