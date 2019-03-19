'use strict';

const esClients = require('../helpers/clients/elastic').startAll().get(),
      {logInfo} = require('../helpers/logger'),
      db        = require('../db/models/index'),
      {indices} = require('config-component').get(module)
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
      logInfo(`Smoke test on ${`Elastic Indices`.info}`);
      return testElasticIndices();
    })
    .then(() => {
      logInfo(`Smoke test on ${'PostGreSQL clients'.info}`);
      return testPgClient();
    })
    ;
};

function testElasticIndices () {
  const promises =
          Object.values(indices)
                .map(
                  ({index}) => {
                    return esClients
                      .main
                      .indices
                      .exists({index})
                      .then(doExists => {
                        if (!doExists) throw new Error(`index_not_found_exception "${index}"`);
                      })
                      ;
                  });

  return Promise.all(promises);
}


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
