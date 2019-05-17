'use strict';

const express                                            = require('express'),
      router                                             = express.Router(),
      _                                                  = require('lodash'),
      he                                                 = require('he'),
      {sourceIdsMap}                                     = require('config-component').get(module),
      db                                                 = require('../db/models/index'),
      {validate: validateBody, normalize: normalizeBody} = require(
        '../src/duplicatesValidationsValidators'),
      reThrow                                            = require('../src/reThrow'),
      records                                            = require('../src/managers/recordsManager'),
      validateQueryString                                = require('../helpers/validateQueryString'),
      getInvalidOptionsHandler                           = require('../src/getInvalidOptionsHandler'),
      {updateDuplicatesTree}                              = require('../src/managers/duplicatesManager')
;

module.exports = router;

const includes = _(sourceIdsMap)
  .values()
  .concat(['idConditor', 'source', 'sourceId', 'sourceUid', 'duplicates', 'nearDuplicates', 'chainId'])
  .value()
;

router.post('/duplicatesValidations', (req, res, next) => {
  if (!req.is('json')) return res.sendStatus(415);

  validateBody(req.body)
    .then(normalizeBody)
    .then(normalizedBody => res.locals.reqBody = normalizedBody)
    .then(() => validateQueryString(req.query, 'access_token', 'debug'))
    .then(getInvalidOptionsHandler(res))
    .then(() => records.getSingleHitByIdConditor(res.locals.reqBody.recordId, {includes}))
    .then(({result: initialRecord}) => {
      const nearDuplicatesIds          = _.map(initialRecord.nearDuplicates, (duplicate) => duplicate.idConditor),
            duplicatesIds              = _.map(initialRecord.duplicates, (duplicate) => duplicate.idConditor),
            reportedRecordsIds         = _.concat(_.chain(res)
                                                   .get('locals.reqBody.reportDuplicates', [])
                                                   .map('recordId')
                                                   .value(),
                                                  _.chain(res)
                                                   .get('locals.reqBody.reportNonDuplicates', [])
                                                   .map('recordId')
                                                   .value()),
            // Sanity checks
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
    .then(reportedRecordsIds => records.searchByIdConditors(reportedRecordsIds, {includes}))
    .then(({result}) => {

      const recordsMap = _buildRecordsMap(result, res.locals.initialRecord);

      return {
        initialRecord      : recordsMap[res.locals.reqBody.recordId],
        reportDuplicates   : _.map(res.locals.reqBody.reportDuplicates,
                                   ({recordId, comment}) => _.chain(recordsMap[recordId])
                                                             .set('comment', comment)
                                                             .set('isDuplicate', true)
                                                             .value()),
        reportNonDuplicates: _.map(res.locals.reqBody.reportNonDuplicates,
                                   ({recordId, comment}) => _.chain(recordsMap[recordId])
                                                             .set('comment', comment)
                                                             .set('isDuplicate', false)
                                                             .value())
      };
    })
    .then(({initialRecord, reportDuplicates, reportNonDuplicates}) => {
      const bulk = _.transform(_.concat(reportDuplicates, reportNonDuplicates), (bulk, targetRecord) => {
        bulk.push({
                    isDuplicate      : targetRecord.isDuplicate,
                    initialSource    : initialRecord.source,
                    initialSourceId  : initialRecord.sourceId,
                    initialIdConditor: initialRecord.idConditor,
                    targetSource     : targetRecord.source,
                    targetSourceId   : targetRecord.sourceId,
                    targetIdConditor : targetRecord.idConditor,
                    comment          : targetRecord.comment && he.encode(targetRecord.comment),
                    UserId           : req.user.id
                  });
      }, []);

      return db.DuplicatesValidations.bulkCreate(bulk, {validate: true, individualHooks: true})
               .then(() => {

                 updateDuplicatesTree({initialRecord, reportDuplicates, reportNonDuplicates});
               });
    })
    .then(() => res.sendStatus(201))
    .catch(reThrow)
    .catch(next)
  ;
});

/*
 * Helpers
 */
function _buildRecordsMap (...records) {
  return _.transform(_.concat(...records),
                     (accu, {source, idConditor, duplicates, nearDuplicates, sourceId, sourceUid, ...record}) => {
                       accu[idConditor] = {
                         idConditor,
                         source,
                         sourceId : sourceId || record[sourceIdsMap[source]],
                         sourceUid: sourceUid || `${source}$${record[sourceIdsMap[source]]}`,
                         duplicates,
                         nearDuplicates
                       };
                     },
                     {}
  );
}

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
