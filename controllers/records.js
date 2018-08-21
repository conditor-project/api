'use strict';

const express                                                          = require('express'),
      {logError, logDebug, logWarning}                                 = require('../helpers/logger'),
      recordsManager                                                   = require('../src/manager/recordsManager'),
      {getResultHandler, getErrorHandler, getSingleResultErrorHandler} = require('../src/resultHandler'),
      _                                                                = require('lodash'),
      firewall                                                         = require('../src/firewall'),
      archiver                                                         = require('archiver')
;

const IS_DUPLICATE          = 'duplicate',
      IS_NOT_DUPLICATE      = 'not_duplicate',
      IS_NEAR_DUPLICATE     = 'near_duplicate',
      IS_NOT_NEAR_DUPLICATE = 'not_near_duplicate'
;
const filterByCriteriaRouteTemplate = `(/:source(hal|wos|sudoc))?`
                                      + `(/:publicationYear(((18|19|20)[0-9]{2})))?`
                                      + `(/:isDuplicate(${IS_DUPLICATE}|${IS_NOT_DUPLICATE}))?`
                                      + `(/:isNearDuplicate(${IS_NEAR_DUPLICATE}|${IS_NOT_NEAR_DUPLICATE}))?`
;
const router = module.exports = express.Router();

router.use(firewall);

// /records(/{source})(/{year})(/{DUPLICATE_FLAG})(/{NEAR_DUPLICATE_FLAG})
router.get(`/records` + filterByCriteriaRouteTemplate,
           (req, res, next) => {
             const criteria = _routeParamsToCriteria(req.params);
             if (_.isEmpty(criteria)) return next();

             recordsManager
               .filterByCriteria(criteria, req.query)
               .then(getResultHandler(res))
               .then(({result}) => res.json(result))
               .catch(getErrorHandler(res))
             ;
           });

// /records(/{source})(/{year})(/{DUPLICATE_FLAG})(/{NEAR_DUPLICATE_FLAG})/zip
router.get(`/records` + filterByCriteriaRouteTemplate + `/zip`,
           (req, res) => {
             const criteria = _routeParamsToCriteria(req.params);

             recordsManager
               .getScrollStreamFilterByCriteria(criteria, req.query)
               .then((scrollStream) => {
                 const archive = archiver('zip');

                 scrollStream
                   .once('data', () => {
                     _setHeaders();
                   })
                   .on('data', (docObject) => {
                     if (archive._state.aborted || archive._state.finalized) return;
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
                       logDebug(`Zip : archive finished ${progress.entries.processed}/${progress.entries.total}`);
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
                     totalCount     : _.get(scrollStream, '_total'),
                     resultCount    : _.get(scrollStream, '_total'),
                     _invalidOptions: _.get(scrollStream, '_invalidOptions')
                   };
                   res.set('Content-type', 'application/zip');
                   res.set('Content-disposition', 'attachment; filename=corpus.zip');
                   getResultHandler(res)(result);
                 }
               })
               .catch(getErrorHandler(res))
             ;
           });

// /records
router.get('/records', (req, res) => {

  recordsManager
    .searchRecords(req.query)
    .then(getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(getErrorHandler(res));
});

// /records/{idConditor}/tei
router.get('/records/:idConditor([0-9A-Za-z_~]+)/tei', (req, res) => {
  recordsManager
    .getSingleTeiByIdConditor(req.params.idConditor, req.query)
    .then(getResultHandler(res))
    .then(({result}) => {
      res.set('Content-Type', 'application/xml');
      res.send(result);
    })
    .catch(getSingleResultErrorHandler(res))
    .catch(getErrorHandler(res))
  ;
});

// /records/{idConditor}
router.get('/records/:idConditor([0-9A-Za-z_~]+)', (req, res) => {
  recordsManager
    .getSingleHitByIdConditor(req.params.idConditor, req.query)
    .then(getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(getSingleResultErrorHandler(res))
    .catch(getErrorHandler(res))
  ;
});


function _routeParamsToCriteria (routeParams) {
  const reqParamsToCriteria = {
    source         : {},
    isDuplicate    : {mapValue: {[IS_DUPLICATE]: true, [IS_NOT_DUPLICATE]: false}},
    isNearDuplicate: {mapValue: {[IS_NEAR_DUPLICATE]: true, [IS_NOT_NEAR_DUPLICATE]: false}},
    publicationYear: {mapKey: 'publicationDate.normalized'} // @Note Change to datePubli.normalized for backward compat
  };

  return _(routeParams)
    .omitBy((value, key) => { return _isNumeric(key); })
    .omitBy(_.isUndefined)
    .transform((accu, value, key) => {
                 value = _.get(reqParamsToCriteria, [key, 'mapValue', _.toLower(value)], value);
                 key = _.get(reqParamsToCriteria, [key, 'mapKey'], key);
                 accu[key] = value;
               },
               {})
    .value();
}

function _isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

