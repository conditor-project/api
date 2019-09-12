'use strict';

const esClients = require('../helpers/clients/elastic').startAll().get(),
      {logInfo} = require('../helpers/logger'),
      db        = require('../db/models/index'),
      {indices} = require('config-component').get(module),
      _         = require('lodash')
;

const smokeTest = {};

module.exports = smokeTest;

smokeTest.run = function() {
  return Promise
    .resolve()
    .then(() => {
      logInfo(`Smoke test on ${'Elastic clients'.info}`);
      return _testElasticClients();
    })
    .then(() => {
      logInfo(`Smoke test on ${`Elastic Indices`.info}`);
      return testElasticIndices();
    })
    .then(() => {
      logInfo(`Smoke test on ${'PostGreSQL clients'.info}`);
      return _testPgClient();
    })
    ;
};

function testElasticIndices () {
  const promises =
                 _.chain(indices)
                .partition({optional: true})
                .last()
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
                  })
                   .value();

  return Promise.all(promises);
}


function _testElasticClients () {
  const promises =
          Object.values(esClients)
                .map(
                  (client) => {
                    return client.cluster
                                 .health();
                  });

  return Promise.all(promises);
}

function _testPgClient () {
  return db.sequelize.authenticate()
    ;
}
