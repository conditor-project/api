'use strict';

const esClients = require('../helpers/clients/elastic').startAll().get(),
      {logInfo} = require('../helpers/logger'),
      db        = require('../db/models/index'),
      _         = require('lodash')
;

const smokeTest = module.exports;

smokeTest.run = function() {
  return Promise
    .resolve()
    .then(() => {
      logInfo(`Smoke test on ${'Elastic clients'.info}`);
      return testElasticClients();
    })
    .then(() => {
      logInfo(`Smoke test on ${'PostGreSQL clients'.info}`);
      return testPgClient();
    })
    ;
};


function testElasticClients () {
  const promises =
          Object.values(esClients)
                .map(
                  (client) => {
                    return client.cluster
                                 .health();
                  });

  return Promise.all(promises);
}

function testPgClient () {
  return db.sequelize.authenticate()
    ;
}
