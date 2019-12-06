'use strict';
/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const Promise = require('bluebird');
const faker = require('faker');
const models = require('../../db/models');
// const { expect } = require('chai');
const generateFakeDoc = require('./generate-fake-doc.js');
const replayHumanValidation = require('../../bin/replay-human-validation.js');
const { main: esClient } = require('../../helpers/clients/elastic').startAll().get();
const esMapping = require('co-config/mapping.json');
const esConf = require('co-config/es.js');
esConf.index = `tests-api-${Date.now()}`;

const docOne = generateFakeDoc();
const duplicatesOfOne = Array(5).fill({}).map(() => generateFakeDoc());
docOne.isDuplicate = true;
docOne.duplicates = [];
docOne.isNearDuplicate = true;
docOne.nearDuplicates = duplicatesOfOne.map(duplicate => ({ idConditor: duplicate.idConditor }));

const humanValidations = duplicatesOfOne.map(duplicate => {
  return {
    isDuplicate: faker.random.boolean(),
    initialSource: docOne.source,
    initialSourceId: docOne.sourceId,
    targetSource: duplicate.source,
    targetSourceId: duplicate.sourceId,
    comment: faker.lorem.sentence(10, 15),
    UserId: faker.random.number(100)
  };
});

describe('replay-human-validation.js', function () {
  before(function () {
    return esClient.indices.create({ index: esConf.index, body: esMapping })
      .then(() => {
        return Promise.map([docOne, ...duplicatesOfOne], (doc) => {
          return esClient.create({
            index: esConf.index,
            type: esConf.type,
            id: doc.idConditor,
            refresh: true,
            body: doc
          });
        });
      })
      .then(() => models.sequelize.sync())
      .then(() => models.Users.create({ email: faker.internet.email() }))
      .then(user => {
        humanValidations.forEach(humanValidation => {
          humanValidation.UserId = user.get('id');
        });
        return Promise.map(humanValidations, humanValidation => {
          return models.DuplicatesValidations.create(humanValidation);
        });
      });
  });

  it('should replay the human validations', function () {
    return replayHumanValidation();
  });

  after(function () {
    return esClient.indices.delete({ index: esConf.index })
      .then(() => models.sequelize.drop())
      .then(() => models.sequelize.close());
  });
});
