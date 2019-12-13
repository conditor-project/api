'use strict';
/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const Promise = require('bluebird');
const faker = require('faker');
const models = require('../../db/models');
const { expect } = require('chai');
const generateFakeDoc = require('./generate-fake-doc.js');
const replayHumanValidation = require('../../bin/replay-human-validation.js');
const { main: esClient } = require('../../helpers/clients/elastic').startAll().get();
const esMapping = require('co-config/mapping.json');
const esConf = require('co-config/es.js');
esConf.index = `tests-api-${Date.now()}`;

const docOne = generateFakeDoc();
const nearDuplicatesOfOne = Array(10)
  .fill({})
  .map(() => generateFakeDoc())
  .map(doc => {
    doc.isDuplicate = true;
    doc.duplicates = [];
    return doc;
  });
docOne.isDuplicate = true;
docOne.duplicates = [];
docOne.isNearDuplicate = true;
docOne.nearDuplicates = nearDuplicatesOfOne.map(duplicate => ({ idConditor: duplicate.idConditor }));

const humanValidations = nearDuplicatesOfOne.map(duplicate => {
  return {
    isDuplicate: faker.random.boolean(),
    initialSource: docOne.source,
    initialSourceId: docOne.sourceId,
    initialIdConditor: docOne.idConditor,
    targetSource: duplicate.source,
    targetSourceId: duplicate.sourceId,
    targetIdConditor: duplicate.idConditor,
    comment: faker.lorem.sentence(10, 15),
    UserId: faker.random.number(100)
  };
});

describe('replay-human-validation.js', function () {
  before(function () {
    return esClient.indices.create({ index: esConf.index, body: esMapping })
      .then(() => {
        return Promise.map([docOne, ...nearDuplicatesOfOne], (doc) => {
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
    return replayHumanValidation()
      .then(() => esClient.search({
        index: esConf.index,
        q: `source:${docOne.source} AND sourceId:${docOne.sourceId}`
      }))
      .then(result => {
        expect(result.hits.hits).to.have.lengthOf(1);
        const doc = result.hits.hits[0]._source;
        expect(doc.idConditor).to.equal(docOne.idConditor);
        const duplicates = doc.duplicates;
        duplicates.map(duplicate => {
          const isDuplicateFound = humanValidations.filter(humanValidation => humanValidation.isDuplicate)
            .some(duplicateValidation => duplicate.source === duplicateValidation.targetSource && duplicate.idConditor === duplicateValidation.targetIdConditor);
          expect(isDuplicateFound).to.be.true;
        });
        const nearDuplicates = doc.nearDuplicates;
        expect(nearDuplicates).to.be.empty;
      });
  });

  after(function () {
    return esClient.indices.delete({ index: esConf.index })
      .then(() => models.sequelize.sync({ force: true }));
  });
});
