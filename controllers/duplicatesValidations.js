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

router.post('/duplicatesValidations', (req, res) => {
  validate(req.body)
    .then((result) => {

      res.send(result);
    })
    .catch(reThrow)
    .catch(getErrorHandler(res))
  ;
});
