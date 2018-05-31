'use strict';

const express                                                          = require('express'),
      router                                                           = express.Router(),
      {logError, logDebug, logWarning}                                  = require('../helpers/logger'),
      recordsManager                                                   = require('../src/manager/recordsManager'),
      {getResultHandler, getErrorHandler, getSingleResultErrorHandler} = require('../src/resultHandler'),
      _                                                                = require('lodash'),
      firewall                                                         = require('../src/firewall'),
      archiver                                                         = require('archiver')
;

const IS_DUPLICATE     = 'duplicate',
      IS_NOT_DUPLICATE = 'not_duplicate'
;

router.use(firewall);

// /records(/{source})(/{year})(/{DUPLICATE_FLAG}(/json))
router.get(
  `/records(/:source(hal|wos|sudoc))?(/:publicationYear(((18|19|20)[0-9]{2})))?(/:isDuplicate(${IS_DUPLICATE}|${IS_NOT_DUPLICATE}))?(/json)?`,
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

// /records(/{source})(/{year})(/{DUPLICATE_FLAG}/zip)
router.get(
  `/records(/:source(hal|wos|sudoc))?(/:publicationYear(((18|19|20)[0-9]{2})))?(/:isDuplicate(${IS_DUPLICATE}|${IS_NOT_DUPLICATE}))?/zip`,
  (req, res) => {
    const criteria = _routeParamsToCriteria(req.params);

    recordsManager
      .getScrollStreamFilterByCriteria(criteria, req.query)
      .then((scrollStream) => {
        const archive = archiver('zip');

        scrollStream
          .once('data', () => {
            res.set('Content-type', 'application/zip');
            res.set('Content-disposition', 'attachment; filename=corpus.zip');
            res.set('X-Total-Count', _.get(scrollStream, '_total'));
            res.set('X-Result-Count', _.get(scrollStream, '_total'));
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
            archive.finalize();
          })
          .on('error', (err) => {
            logError('Zip : Scroll stream  error \n', err);
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
          .on('end', () =>{
            logDebug('Zip : Archiver closed');
          });

        req.connection.on('close',function(){
          logDebug('Zip: connection closed');
          scrollStream.close();
          archive.abort();
        });

        res
          .on('finish', () => {logDebug('Zip : response finished');})
          .on('error', (err) => {logError('Zip : response error \n', err);});

        archive.pipe(res);
      })
      .catch(getErrorHandler(res))
    ;
  });

// /records(/json)
router.get('/records(/json)?', (req, res) => {
  recordsManager
    .searchRecords(req.query)
    .then(getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(getErrorHandler(res))
  ;
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

// /records/{idConditor}(/json)
router.get('/records/:idConditor([0-9A-Za-z_~]+)(/json)?', (req, res) => {
  recordsManager
    .getSingleHitByIdConditor(req.params.idConditor, req.query)
    .then(getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(getSingleResultErrorHandler(res))
    .catch(getErrorHandler(res))
  ;
});

// @todo Work in progress
router.get('/records', (req, res, next) => {
  return next(); // to remove

  if (!req.query.filter) return next();

  recordsManager
    .filterRecords(req.query)
    .then(getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(getErrorHandler(res));
});


module.exports = router;


function _routeParamsToCriteria (routeParams) {
  const reqParamsToCriteria = {
    source         : {},
    isDuplicate    : {mapValue: {[IS_DUPLICATE]: true, [IS_NOT_DUPLICATE]: false}},
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

