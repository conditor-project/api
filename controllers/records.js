'use strict';

const express                                                          = require('express'),
      {logError, logDebug, logWarning}                                 = require('../helpers/logger'),
      records                                                          = require('../src/managers/recordsManager'),
      {getResultHandler, getErrorHandler, getSingleResultErrorHandler} = require('../src/resultHandler'),
      _                                                                = require('lodash'),
      archiver                                                         = require('archiver'),
      isNumeric                                                        = require('../helpers/isNumeric'),
      validateQueryString                                              = require('../helpers/validateQueryString'),
      getInvalidOptionsHandler                                         = require('../src/getInvalidOptionsHandler')
;

const IS_DUPLICATE          = 'duplicate',
      IS_NOT_DUPLICATE      = 'not_duplicate',
      IS_NEAR_DUPLICATE     = 'near_duplicate',
      IS_NOT_NEAR_DUPLICATE = 'not_near_duplicate'
;

// @todo make dynamic source
const filterByCriteriaRouteTemplate = `(/:source(hal|sudoc|crossref|pubmed))?`
                                      + `(/:publicationYear(((18|19|20)[0-9]{2})))?`
                                      + `(/:isDuplicate(${IS_DUPLICATE}|${IS_NOT_DUPLICATE}))?`
                                      + `(/:isNearDuplicate(${IS_NEAR_DUPLICATE}|${IS_NOT_NEAR_DUPLICATE}))?`
;

const router = module.exports = express.Router();

// /records/_filter(/{source})(/{year})(/{DUPLICATE_FLAG})(/{NEAR_DUPLICATE_FLAG})
router.get(`/records/_filter` + filterByCriteriaRouteTemplate,
           (req, res, next) => {
             validateQueryString(req.query, records.filterByCriteria.options, 'access_token', 'debug')
               .then(getInvalidOptionsHandler(res))
               .then((query) => {
                 const
                   criteria = _routeParamsToCriteria(req.params);

                 return records
                   .filterByCriteria(criteria, query)
                   .then(getResultHandler(res))
                   .then(({result}) => res.json(result))
                   ;
               })
               .catch(next);
           });

// /records/_filter(/{source})(/{year})(/{DUPLICATE_FLAG})(/{NEAR_DUPLICATE_FLAG})/zip
router.get(`/records(/_filter` + filterByCriteriaRouteTemplate + `)?/zip`,
           (req, res,next) => {
             validateQueryString(req.query, records.getScrollStreamFilterByCriteria.options, 'access_token', 'debug')
               .then(getInvalidOptionsHandler(res))
               .then((query) => {
                 const criteria = _routeParamsToCriteria(req.params);

                 return records
                   .getScrollStreamFilterByCriteria(criteria, query)
                   .then((scrollStream) => {
                     const archive = archiver('zip');

                     scrollStream
                       .once('data', () => {
                         _setHeaders();
                       })
                       .on('data', (docObject) => {
                         if (archive._state.aborted || archive._state.finalized || scrollStream._isClosed) return;
                         archive
                           .append(JSON.stringify(docObject),
                                   {name: docObject.idConditor}
                           );
                       })
                       .on('end', () => {
                         logDebug('Zip : Scroll stream  finished');
                         if (!res.headersSent) {
                           _setHeaders();
                         }
                         archive.finalize();
                       })
                       .on('error', (err) => {
                         logError('Zip : Scroll stream  error');
                         archive.abort();
                         getErrorHandler(res)(err);
                       })
                     ;

                     archive
                       .on('error', (error) => {
                         logError('Zip : Archiver error \n', error);
                         scrollStream.close();
                         archive.abort();
                       })
                       .on('progress', (progress) => {
                         if (_.get(scrollStream, '_total') === progress.entries.processed) {
                           logDebug(`Zip : archive finished ${progress.entries.processed}/${progress.entries.total} documents`);
                         }
                       })
                       .on('warning', (warning) => {
                         logWarning('Zip : Archiver warning ', warning);
                       })
                       .on('end', () => {
                         logDebug('Zip : Archiver closed');
                       });

                     req.connection.on('close', function() {
                       logDebug('Zip: connection closed');
                       scrollStream.close();
                       archive.abort();
                     });

                     res
                       .on('finish', () => {logDebug('Zip : response finished');})
                       .on('error', (err) => {logError('Zip : response error \n', err);});

                     archive.pipe(res);

                     function _setHeaders () {
                       const result = {
                         totalCount : _.get(scrollStream, '_total'),
                         resultCount: _.get(scrollStream, '_resultCount'),
                         addWarning : addWarning
                       };
                       res.set('Content-type', 'application/zip');
                       res.set('Content-disposition', 'attachment; filename=corpus.zip');
                       getResultHandler(res)(result);
                     }
                   });
               })
               .catch(next);
           });

// @todo add result builder or find more elegant
function addWarning (warning) {
  const warnings = _.get(this, '_warnings', []);
  warnings.push(warning);
  this._warnings = warnings;

  return this;
}

// /records
router.get('/records', (req, res, next) => {
  validateQueryString(req.query, records.search.options, 'access_token', 'debug')
    .then(getInvalidOptionsHandler(res))
    .then((query) => {
      return records
        .search(query)
        .then(getResultHandler(res))
        .then(({result}) => res.json(result))
        ;
    })
    .catch(next)
  ;
});

// /records/{idConditor}/tei
router.get('/records/:idConditor([0-9A-Za-z_~]+)/tei', (req, res, next) => {
  validateQueryString(req.query, records.getSingleTeiByIdConditor.options, 'access_token', 'debug')
    .then(getInvalidOptionsHandler(res))
    .then((query) => {
      return records
        .getSingleTeiByIdConditor(req.params.idConditor, query)
        .then(getResultHandler(res))
        .then(({result}) => {
          res.set('Content-Type', 'application/xml');
          res.send(result);
        })
        .catch(getSingleResultErrorHandler(res))
        .catch(next)
        ;
    });

});


// /records/{idConditor}/duplicates
router.get('/records/:idConditor([0-9A-Za-z_~]+)/duplicates', (req, res, next) => {
  validateQueryString(req.query, records.getDuplicatesByIdConditor.options, 'access_token', 'debug')
    .then(getInvalidOptionsHandler(res))
    .then((query) => {
      return records
        .getDuplicatesByIdConditor(req.params.idConditor, query)
        .then(getResultHandler(res))
        .then(({result}) => res.json(result))
        .catch(next)
        ;
    });
});


// /records/{idConditor}/duplicates/and_self
router.get('/records/:idConditor([0-9A-Za-z_~]+)/duplicates/and_self', (req, res, next) => {
  validateQueryString(req.query, records.getDuplicatesByIdConditor.options, 'access_token', 'debug')
    .then(getInvalidOptionsHandler(res))
    .then((query) => {
      return records
        .getDuplicatesByIdConditor(req.params.idConditor, query, 'and_self')
        .then(getResultHandler(res))
        .then(({result}) => res.json(result))
        .catch(next)
        ;
    });
});

// /records/{idConditor}/near_duplicates
router.get('/records/:idConditor([0-9A-Za-z_~]+)/near_duplicates', (req, res, next) => {
  validateQueryString(req.query, records.getNearDuplicatesByIdConditor.options, 'access_token', 'debug')
    .then(getInvalidOptionsHandler(res))
    .then((query) => {
      return records
        .getNearDuplicatesByIdConditor(req.params.idConditor, query)
        .then(getResultHandler(res))
        .then(({result}) => res.json(result))
        .catch(next)
        ;
    });
});

// /records/{idConditor}/near_duplicates/and_self
router.get('/records/:idConditor([0-9A-Za-z_~]+)/near_duplicates/and_self', (req, res, next) => {
  validateQueryString(req.query, records.getNearDuplicatesByIdConditor.options, 'access_token', 'debug')
    .then(getInvalidOptionsHandler(res))
    .then((query) => {
      return records
        .getNearDuplicatesByIdConditor(req.params.idConditor, query, 'and_self')
        .then(getResultHandler(res))
        .then(({result}) => res.json(result))
        .catch(next)
        ;
    });
});

// /records/{idConditor}
router.get('/records/:idConditor([0-9A-Za-z_~]+)', (req, res, next) => {
  validateQueryString(req.query, records.getSingleHitByIdConditor.options, 'access_token', 'debug')
    .then(getInvalidOptionsHandler(res))
    .then((query) => {
      return records
        .getSingleHitByIdConditor(req.params.idConditor, query)
        .then(getResultHandler(res))
        .then(({result}) => res.json(result))
        .catch(getSingleResultErrorHandler(res))
        .catch(next)
        ;
    });
});


function _routeParamsToCriteria (routeParams) {
  const reqParamsToCriteria = {
    source         : {},
    isDuplicate    : {mapValue: {[IS_DUPLICATE]: true, [IS_NOT_DUPLICATE]: false}},
    isNearDuplicate: {mapValue: {[IS_NEAR_DUPLICATE]: true, [IS_NOT_NEAR_DUPLICATE]: false}},
    publicationYear: {mapKey: 'publicationDate.normalized'} // @Note Change to datePubli.normalized for backward compat
  };

  return _(routeParams)
    .omitBy((value, key) => { return isNumeric(key); })
    .omitBy(_.isUndefined)
    .transform((accu, value, key) => {
                 value = _.get(reqParamsToCriteria, [key, 'mapValue', _.toLower(value)], value);
                 key = _.get(reqParamsToCriteria, [key, 'mapKey'], key);
                 accu[key] = value;
               },
               {})
    .value();
}
