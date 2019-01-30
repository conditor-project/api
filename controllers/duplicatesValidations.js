'use strict';

const express                                                          = require('express'),
      router                                                           = express.Router(),
      {validate}                                                       = require(
        '../src/duplicatesValidationsValidators'),
      {logError, logDebug, logWarning}                                 = require('../helpers/logger'),
      {getResultHandler, getErrorHandler, getSingleResultErrorHandler} = require('../src/resultHandler'),
      reThrow                                                          = require('../src/reThrow')
;

module.exports = router;

router.post('/duplicatesValidations', (req, res, next) => {
  validate(req.body)
    .then((reqBody) => {

      res.status(204).send();
    })
    .catch(reThrow)
    .catch(next)
  ;
});
