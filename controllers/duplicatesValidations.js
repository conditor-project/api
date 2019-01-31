'use strict';

const express                                                          = require('express'),
      router                                                           = express.Router(),
      _                                                                = require('lodash'),
      {validate}                                                       = require(
        '../src/duplicatesValidationsValidators'),
      {logError, logDebug, logWarning}                                 = require('../helpers/logger'),
      {getResultHandler, getErrorHandler, getSingleResultErrorHandler} = require('../src/resultHandler'),
      reThrow                                                          = require('../src/reThrow'),
      records                                                          = require('../src/manager/recordsManager')
;

module.exports = router;

router.post('/duplicatesValidations', (req, res, next) => {
  validate(req.body)
    .then((reqBody) => records.getSingleHitByIdConditor(reqBody.recordId,
                                                        {includes: 'idConditor, duplicates, nearDuplicates'})
    )
    .then(({result:record}) => {
      const nearDuplicatesIds = _.map(record.nearDuplicates,(duplicate)=> duplicate.idConditor);
      //console.dir(nearDuplicatesIds)
      res.send(record);
    })
    .catch(reThrow)
    .catch(next)
  ;
});
