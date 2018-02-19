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

const reqParamsToCriteria = {
  isDuplicate: {mapValue: {[IS_DUPLICATE]: true, [IS_NOT_DUPLICATE]: false}},
  datePubli  : {mapKey: 'datePubli.normalized'}
};

function _filterUselessParams (params) {
  return _(params)
    .pickBy(
      (value, key) => { return _.isNaN(_.toNumber(key)); })
    .omitBy(_.isUndefined)
    .value();
}

function _mapParams (params) {
  return _.transform(params,
                     (accu, value, key) => {
                       value = _.get(reqParamsToCriteria, [key, 'mapValue', _.toLower(value)], value);
                       key = _.get(reqParamsToCriteria, [key, 'mapKey'], key);
                       accu[key] = value;
                     },
                     {});
}

function _getResultHandler (res) {
  return ({result, resultCount, totalCount, scrollId}) => {
    scrollId && res.set('Scroll-Id', scrollId);
    res.set('X-Total-Count', totalCount);
    res.set('X-Result-Count', resultCount);
    console.log(res.get('X-Total-Count'))
    res.json(result);
  };
}

function _getErrorCatcher (res) {
  return (err) => {
    let status = 500;
    logError(err);
    if (err.status === 400) status = 400;
    res.sendStatus(status);
  };
}

router.use('/records', (req, res, next) => {
  if (!req.query.scroll_id) return next();

  recordsManager
    .scroll(req.query)
    .then(_getResultHandler(res))
    .catch(_getErrorCatcher(res))
  ;
});

router.get(
  `/records(/:source(hal|wos))?(/:datePubli(((18|19|20)[0-9]{2})))?(/:isDuplicate(${IS_DUPLICATE}|${IS_NOT_DUPLICATE}))?`,
  (req, res, next) => {
    const params = _filterUselessParams(req.params);
    if (_.isEmpty(params)) return next();

    const criteria = _mapParams(params);

    recordsManager
      .filterByCriteria(criteria, req.query)
      .then(_getResultHandler(res))
      .catch(_getErrorCatcher(res));
  });

router.get('/records/:idConditor([0-9A-Za-z_~]+)/tei', (req, res, next) => {
  recordsManager
    .getSinglePathByIdConditor(req.params.idConditor)
    .then(({result, total}) => {
      res.set('Content-Type', 'application/tei+xml');
      res.set('X-Total-Count', total);
      res.sendFile(result, (err) => {
        if (err && err.code === 'ENOENT') return res.sendStatus(410);
        if (err) next(err);
      });
    })
    .catch((err) => {
      if (err.name === 'NoResultException') return res.sendStatus(404);
      logError(err);
      res.sendStatus(500);
    });
});

router.get('/records/:idConditor([0-9A-Za-z_~]+)', (req, res) => {
  recordsManager
    .getSingleHitByIdConditor(req.params.idConditor, req.query)
    .then(_getResultHandler(res))
    .catch((err) => {
      if (err.name === 'NoResultException') return res.sendStatus(404);
      throw(err);
    })
    .catch(_getErrorCatcher(res))
  ;
});

router.get('/records/filter', (req, res, next) => {
  if (_.isEmpty(req.query) || !req.query.filter) return next();

  recordsManager
    .search(req.query)
    .then(({result, total, scrollId}) => {
      res.set('X-Total-Count', total);
      scrollId && res.set('Scroll-Id', scrollId);
      res.json(result);
    })
    .catch((err) => {
      logError(err);
      res.sendStatus(500);
    });
});


router.get('/records', (req, res) => {
  recordsManager
    .searchRecords(req.query)
    .then(({result, total, scrollId}) => {
      res.set('X-Total-Count', total);
      scrollId && res.set('Scroll-Id', scrollId);
      res.json(result);
    })
    .catch((err) => {
      logError(err);
      res.sendStatus(500);
    });
});

module.exports = router;
