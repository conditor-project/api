'use strict';

const express          = require('express'),
      router           = express.Router(),
      logger           = require('../helpers/logger'),
      logInfo          = logger.logInfo,
      logError         = logger.logError,
      recordsManager   = require('../src/manager/recordsManager'),
      _                = require('lodash')
;

const paramsToCriteria = {
  isDuplicate: {mapValue: {is_duplicate: true, is_not_duplicate: false}},
  datePubli  : {mapKey: 'datePubli.normalized'}
};

function _filterParams (params) {
  return _(params)
    .pickBy(
      (value, key) => { return _.isNaN(_.toNumber(key)); })
    .omitBy(_.isUndefined)
    .value();
}

function _mapParams (params) {
  return _.transform(params,
                     (accu, value, key) => {
                       value = _.get(paramsToCriteria, [key, 'mapValue', _.toLower(value)], value);
                       key = _.get(paramsToCriteria, [key, 'mapKey'], key);
                       accu[key] = value;
                     },
                     {});
}

router.get(
  '/records(/:source(hal|wos))?(/:datePubli(((18|19|20)[0-9]{2})))?(/:isDuplicate(is_duplicate|is_not_duplicate))?',
  (req, res, next) => {
    const params = _filterParams(req.params);
    if (_.isEmpty(params)) return next();

    let criteria = _mapParams(params);

    recordsManager
      .filterByCriteria(criteria)
      .then(({result, total}) => {
        res.set('X-Total-Count', total);
        res.json(result);
      })
      .catch((err) => {
        logError(err);
        res.sendStatus(500);
      });
  });

router.get('/records/:idConditor([0-9A-Za-z_~]+)/tei', (req, res) => {
  recordsManager
    .getSinglePathByIdConditor(req.params.idConditor)
    .then(({result, total}) => {

      res.set('X-Total-Count', total);
      res.sendFile(result);
    })
    .catch((err) => {
      if (err.name === 'NoResultException') return res.sendStatus(404);
      logError(err);
      res.sendStatus(500);
    });
});

router.get('/records/:idConditor([0-9A-Za-z_~]+)', (req, res) => {
  recordsManager
    .getSingleHitByIdConditor(req.params.idConditor)
    .then(({result, total}) => {
      res.set('X-Total-Count', total);
      res.json(result);
    })
    .catch((err) => {
      if (err.name === 'NoResultException') return res.sendStatus(404);
      logError(err);
      res.sendStatus(500);
    });
});

router.get('/records/filter', (req, res, next) => {
  if (_.isEmpty(req.query) || !req.query.filter) return next();

  recordsManager
    .search(req.query)
    .then(({result, total}) => {
      res.set('X-Total-Count', total);
      res.json(result);
    })
    .catch((err) => {
      logError(err);
      res.sendStatus(500);
    });
});


router.get('/records', (req, res) => {
  recordsManager
    .searchAll()
    .then(({result, total}) => {
      res.set('X-Total-Count', total);
      res.json(result);
    })
    .catch((err) => {
      logError(err);
      res.sendStatus(500);
    });
});

module.exports = router;
