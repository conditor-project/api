'use strict';

const esClients           = require('../helpers/clients/elastic').startAll().get(),
      pgClients           = require('../helpers/clients/pg').startAll().get(),
      {logError, logInfo} = require('../helpers/logger')
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
      return testPgClients();
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

function testPgClients () {
  const promises =
          Object.values(pgClients)
                .map(
                  (client) => {
                    return client.authenticate();
                  });

  return Promise.all(promises);
}
