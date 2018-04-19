'use strict';

const express        = require('express'),
      router         = express.Router(),
      {logError}     = require('../helpers/logger'),
      recordsManager = require('../src/manager/recordsManager'),
      _              = require('lodash'),
      firewall       = require('../src/firewall'),
      archiver       = require('archiver'),
      {Writable}     = require('stream')
;

const IS_DUPLICATE     = 'duplicate',
      IS_NOT_DUPLICATE = 'not_duplicate'
;

router.use(firewall);

// /records?scroll_id={SCROLL_ID}&scroll={DurationString}
router.get('/records', (req, res, next) => {
  if (!req.query.scroll_id) return next('route');

  recordsManager
    .scroll(req.query)
    .then(_getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(_getErrorHandler(res))
  ;
});

// /records(/{source})(/{year})(/{DUPLICATE_FLAG})
router.get(
  `/records(/:source(hal|wos|sudoc))?(/:publicationYear(((18|19|20)[0-9]{2})))?(/:isDuplicate(${IS_DUPLICATE}|${IS_NOT_DUPLICATE}))?`,
  (req, res, next) => {
    const criteria = _routeParamsToCriteria(req.params);
    if (_.isEmpty(criteria)) return next();

    recordsManager
      .filterByCriteria(criteria, req.query)
      .then(_getResultHandler(res))
      .then(({result}) => res.json(result))
      .catch(_getErrorHandler(res))
    ;
  });


// /records(/json)
router.get('/records(/json)?', (req, res) => {
  recordsManager
    .searchRecords(req.query)
    .then(_getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(_getErrorHandler(res))
  ;
});

// /records/zip
router.get('/records/zip', (req, res) => {

  recordsManager
    .getScrollStream(req.query)
    .then((scrollStream) => {
      const archive = archiver('zip');

      res.set('Content-type', 'application/zip');
      res.set('Content-disposition', 'attachment; filename=corpus.zip');

      const ws = new Writable({objectMode: true});

      ws._write = function write (docObject, enc, next) {
        write.count = write.count || 0;
        console.log(docObject.idConditor)
        archive
          .append(JSON.stringify(docObject),
                  {name: docObject.idConditor}
          );
        next();
      };

      ws.on('error', (error) => {
        logError(error);
        archive.finalize();
      });
      ws.on('finish', () => {archive.finalize();});

      archive.pipe(res);

      scrollStream
        .pipe(ws);

    })
    .catch(_getErrorHandler(res))
  ;
});

// /records/{idConditor}/tei
router.get('/records/:idConditor([0-9A-Za-z_~]+)/tei', (req, res) => {
  recordsManager
    .getSingleTeiByIdConditor(req.params.idConditor, req.query)
    .then(_getResultHandler(res))
    .then(({result}) => {
      res.set('Content-Type', 'application/xml');
      res.send(result);
    })
    .catch(_getSingleResultErrorHandler(res))
    .catch(_getErrorHandler(res))
  ;
});

// /records/{idConditor}(/json)
router.get('/records/:idConditor([0-9A-Za-z_~]+)(/json)?', (req, res) => {
  recordsManager
    .getSingleHitByIdConditor(req.params.idConditor, req.query)
    .then(_getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(_getSingleResultErrorHandler(res))
    .catch(_getErrorHandler(res))
  ;
});

// @todo Work in progress
router.get('/records', (req, res, next) => {
  return next(); // to remove

  if (!req.query.filter) return next();

  recordsManager
    .filterRecords(req.query)
    .then(_getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(_getErrorHandler(res));
});


module.exports = router;


function _routeParamsToCriteria (routeParams) {
  const reqParamsToCriteria = {
    source         : {},
    isDuplicate    : {mapValue: {[IS_DUPLICATE]: true, [IS_NOT_DUPLICATE]: false}},
    publicationYear: {mapKey: 'datePubli.normalized'}
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

function _getResultHandler (res) {
  return ({result, resultCount, totalCount, scrollId, ...rest}) => {
    scrollId && res.set('Scroll-Id', scrollId);
    res.set('X-Total-Count', totalCount);
    res.set('X-Result-Count', resultCount);

    return _.assign({result, resultCount, totalCount, scrollId}, rest);
  };
}

function _getSingleResultErrorHandler (res) {
  return (err) => {
    if (err.name === 'NoResultException') return res.sendStatus(404);
    if (err.name === 'NonUniqueResultException') return res.sendStatus(300);
    throw(err);
  };
}

function _getErrorHandler (res) {
  return (reason) => {
    let status = [400, 404].includes(reason.status) ? reason.status : 500;
    logError(reason);
    res.sendStatus(status);
  };
}


