'use strict';

const express          = require('express'),
      router           = express.Router(),
      elasticContainer = require('../helpers/clients/elastic').get(),
      esClient         = elasticContainer.main,
      esResultFormat   = require('../helpers/esResultFormat'),
      logger           = require('../helpers/logger'),
      logInfo          = logger.logInfo,
      logError         = logger.logError
;

router.get('/documents/:id([0-9A-Za-z]+)', (req, res, next) => {
  esClient
    .search({index: 'notices', q: `idConditor:${req.params.id}`})
    .then((body) => {
      res.json(esResultFormat.getSingleHit(body));
    })
    .catch((err) => {
      logError(err);
      res.sendStatus(500);
    });
});


module.exports = router;
