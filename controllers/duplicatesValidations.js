'use strict';

const express                                                          = require('express'),
      router                                                           = express.Router(),
      _                                                                = require('lodash'),
      {validate: validateBody, normalize: normalizeBody}               = require(
        '../src/duplicatesValidationsValidators'),
      {logError, logDebug, logWarning}                                 = require('../helpers/logger'),
      {getResultHandler, getErrorHandler, getSingleResultErrorHandler} = require('../src/resultHandler'),
      reThrow                                                          = require('../src/reThrow'),
      records                                                          = require('../src/manager/recordsManager'),
      validateQueryString                                              = require('../helpers/validateQueryString'),
      getInvalidOptionsHandler                                         = require('../src/getInvalidOptionsHandler'),
      {sourceIdsMap}                                                   = require('config-component').get(module),
      db                                                               = require('../db/models/index'),
      he                                                               = require('he')
;

module.exports = router;

router.post('/duplicatesValidations', (req, res, next) => {
  if (!req.is('json')) return res.sendStatus(415);

  validateBody(req.body)
    .then(normalizeBody)
    .then(body => res.locals.body = body)
    .then(() => validateQueryString(req.query, 'access_token', 'debug'))
    .then(getInvalidOptionsHandler(res))
    .then(() => records.getSingleHitByIdConditor(res.locals.body.recordId,
                                                 {includes: `${_.values(sourceIdsMap)}, source,idConditor, duplicates, nearDuplicates`})
    )
    .then(({result: initialRecord}) => {
      const nearDuplicatesIds          = _.map(initialRecord.nearDuplicates, (duplicate) => duplicate.idConditor),
            duplicatesIds              = _.map(initialRecord.duplicates, (duplicate) => duplicate.idConditor),
            reportedRecordsIds         = _.concat(_.chain(res)
                                                   .get('locals.body.reportDuplicates', [])
                                                   .map('recordId')
                                                   .value(),
                                                  _.chain(res)
                                                   .get('locals.body.reportNonDuplicates', [])
                                                   .map('recordId')
                                                   .value()),
            invalidRecordsIds          = _.difference(reportedRecordsIds, nearDuplicatesIds),
            nonUniqValidatedRecordsIds = _(reportedRecordsIds).groupBy()
                                                              .pickBy(group => group.length > 1)
                                                              .keys()
                                                              .value(),
            duplicatesIntersection     = _.intersection(reportedRecordsIds, duplicatesIds)
      ;

      if (nonUniqValidatedRecordsIds.length) throw nonUniqueRecordsIdsException(nonUniqValidatedRecordsIds);
      if (invalidRecordsIds.length) throw invalidRecordsIdsException(invalidRecordsIds);
      if (duplicatesIntersection.length) throw duplicatesIntersectionException(duplicatesIntersection);

      res.locals.initialRecord = initialRecord;
      return reportedRecordsIds;
    })
    .then(reportedRecordsIds => records.searchByIdConditors(reportedRecordsIds,
                                                            {includes: `${_.values(sourceIdsMap)}, idConditor, source, sourceId, sourceUid, duplicates, nearDuplicates`})
    )
    .then(result => _.transform(_.concat(result.result, res.locals.initialRecord),
                                (accu, {source, idConditor, duplicates, nearDuplicates, sourceId, sourceUid, ...record}) => {
                                  accu[idConditor] = {
                                    idConditor,
                                    source,
                                    sourceId : sourceId || record[sourceIdsMap[source]],
                                    sourceUid: sourceUid || `${source}#${record[sourceIdsMap[source]]}`,
                                    duplicates,
                                    nearDuplicates
                                  };
                                },
                                {}
          )
    )
    .then(result => {
      return {
        initialRecord      : result[res.locals.body.recordId],
        reportDuplicates   : _.map(res.locals.body.reportDuplicates,
                                   ({recordId, comment}) => _.set(result[recordId], 'comment', comment)),
        reportNonDuplicates: _.map(res.locals.body.reportNonDuplicates,
                                   ({recordId, comment}) => _.set(result[recordId], 'comment', comment))
      };
    })
    .then(({initialRecord, reportDuplicates, reportNonDuplicates}) => {

      const duplicatesBulk = _.transform(reportDuplicates, (bulk, targetRecord) => {
        bulk.push({
                    isDuplicate      : true,
                    initialSource    : initialRecord.source,
                    initialSourceId  : initialRecord.sourceId,
                    initialIdConditor: initialRecord.idConditor,
                    targetSource     : targetRecord.source,
                    targetSourceId   : targetRecord.sourceId,
                    targetIdConditor : targetRecord.idConditor,
                    comment          : he.encode(targetRecord.comment),
                    UserId           : req.user.id
                  });
      }, []);

      const nonDuplicatesBulk = _.transform(reportNonDuplicates, (bulk, targetRecord) => {
        bulk.push({
                    isDuplicate      : false,
                    initialSource    : initialRecord.source,
                    initialSourceId  : initialRecord.sourceId,
                    initialIdConditor: initialRecord.idConditor,
                    targetSource     : targetRecord.source,
                    targetSourceId   : targetRecord.sourceId,
                    targetIdConditor : targetRecord.idConditor,
                    comment          : he.encode(targetRecord.comment),
                    UserId           : req.user.id
                  });
      }, []);

      const bulk = duplicatesBulk.concat(nonDuplicatesBulk);

      return db.DuplicatesValidations.bulkCreate(bulk, {validate: true, individualHooks: true});
    })
    .then(() => res.sendStatus(201))
    .catch(reThrow)
    .catch(next)
  ;
});

/*
 * Exceptions
 */
function invalidRecordsIdsException (invalidRecordsIds) {
  let err = new Error(`Records ${invalidRecordsIds} must be present in record.nearDuplicates collection.`);
  err.name = 'invalidRecordsIdsException';
  err.status = 400;
  return err;
}

function nonUniqueRecordsIdsException (notUniqValidatedRecordsIds) {
  let err = new Error(`Records Ids must be unique across the reportDuplicates and reportNonDuplicates collections, found: ${notUniqValidatedRecordsIds}`);
  err.name = 'nonUniqueRecordsIdsException';
  err.status = 400;
  return err;
}

function duplicatesIntersectionException (duplicatesIntersection) {
  let err = new Error(`Records Ids must be not be present in record.duplicates collections, found: ${duplicatesIntersection}`);
  err.name = 'duplicatesIntersectionException';
  err.status = 400;
  return err;
}
