'use strict';

const esClients           = require('../helpers/clients/elastic').startAll().get(),
      {logError, logInfo} = require('../helpers/logger')
;


const smokeTest = module.exports;


smokeTest.run = function() {
  return Promise
    .resolve()
    .then(() => {
      logInfo(`Smoke test on ${'Elastic clients'.info}`);

      return testElasticClients();
    });
};


function testElasticClients () {
  const promises = Object
    .values(esClients)
    .map(
      (client) => {
        return client
          .cluster
          .health()
          ;
      });

  return Promise
    .all(promises);
}
