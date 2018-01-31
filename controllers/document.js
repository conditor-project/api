'use strict';

const express          = require('express'),
      router           = express.Router(),
      elasticContainer = require('../helpers/clients/elastic').get(),
      esClient         = elasticContainer.main,
      esResultFormat   = require('../helpers/esResultFormat'),
      logger           = require('../helpers/logger'),
      logInfo          = logger.logInfo,
      logError         = logger.logError,
      parser           = require('lucene-query-parser'),
      bodybuilder      = require('bodybuilder')
;


router.get('/documents/:id([0-9A-Za-z]+)', (req, res) => {
  esClient
    .search({index: 'notices', q: `idConditor:${req.params.id}`})
    .then((body) => {
      res.json(esResultFormat.getSingleHit(body));
    })
    .catch((err) => {
      if (err.name === 'NoResultException') return res.sendStatus(404);
      logError(err);
      res.sendStatus(500);
    });
});


router.get('/documents', (req, res, next) => {

  const
    parsedQuery = parser.parse(req.query.q),
    reqBody = bodybuilder().query('match', parsedQuery.left.field, parsedQuery.left.term).build();
  console.log(reqBody)
  esClient
    .search({index: 'notices', body:reqBody})
    .then((resBody) => {
      res.json(resBody);
    })
    .catch((err) => {
      if (err.name === 'NoResultException') return res.sendStatus(404);
      logError(err);
      res.sendStatus(500);
    });
});


module.exports = router;
