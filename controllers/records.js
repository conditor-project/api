'use strict';

const express        = require('express'),
      router         = express.Router(),
      logger         = require('../helpers/logger'),
      logInfo        = logger.logInfo,
      logError       = logger.logError,
      recordsManager = require('../src/manager/recordsManager'),
      _              = require('lodash')
;

const IS_DUPLICATE     = 'duplicate',
      IS_NOT_DUPLICATE = 'not_duplicate'
;


// /records(/{ALL})?scroll_id={SCROLL_ID}&scroll={DurationString}
router.use('/records', (req, res, next) => {
  if (!req.query.scroll_id) return next();

  recordsManager
    .scroll(req.query)
    .then(_getResultHandler(res))
    .catch(_getErrorHandler(res))
  ;
});

// /records(/{source})(/{year})(/{DUPLICATE_FLAG})
router.get(
  `/records(/:source(hal|wos))?(/:publicationYear(((18|19|20)[0-9]{2})))?(/:isDuplicate(${IS_DUPLICATE}|${IS_NOT_DUPLICATE}))?`,
  (req, res, next) => {
    const criteria = _routeParamsToCriteria(req.params);
    if (_.isEmpty(criteria)) return next();

    recordsManager
      .filterByCriteria(criteria, req.query)
      .then(_getResultHandler(res))
      .catch(_getErrorHandler(res));
  });


// /records/{idConditor}/tei
router.get('/records/:idConditor([0-9A-Za-z_~]+)/tei', (req, res, next) => {
  recordsManager
    .getTeiByIdConditor(req.params.idConditor)
    .then(({result, total}) => {
      res.set('Content-Type', 'application/xml');
      res.set('X-Total-Count', total);
      res.send(result);
    })
    .catch((err) => {
      if (err.name === 'NoResultException') return res.sendStatus(404);
      logError(err);
      res.sendStatus(500);
    });
});

// /records/{idConditor}
router.get('/records/:idConditor([0-9A-Za-z_~]+)', (req, res) => {
  recordsManager
    .getSingleHitByIdConditor(req.params.idConditor, req.query)
    .then(_getResultHandler(res))
    .catch((err) => {
      if (err.name === 'NoResultException') return res.sendStatus(404);
      throw(err);
    })
    .catch(_getErrorHandler(res))
  ;
});


// /records
router.get('/records', (req, res) => {
  recordsManager
    .searchRecords(req.query)
    .then(_getResultHandler(res))
    .catch(_getErrorHandler(res));
});


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
  return ({result, resultCount, totalCount, scrollId}) => {
    scrollId && res.set('Scroll-Id', scrollId);
    res.set('X-Total-Count', totalCount);
    res.set('X-Result-Count', resultCount);
    res.json(result);
  };
}

function _getErrorHandler (res) {
  return (err) => {
    let status = [400, 404].includes(err.status) ? err.status : 500;
    logError(err);
    res.sendStatus(status);
  };
}

module.exports = router;
