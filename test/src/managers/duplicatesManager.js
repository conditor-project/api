'use strict';

const request                = require('supertest'),
      should                 = require('should'), // jshint ignore:line
      {logInfo}              = require('../../../helpers/logger'),
      _                      = require('lodash'),
      semver                 = require('semver'),
      {indices}              = require('config-component').get(module),
      {updateDuplicatesTree} = require('../../../src/managers/duplicatesManager'),
      createIndexNx          = require('../../../helpers/esHelpers/createIndiceNx'),
      deleteIndexIx          = require('../../../helpers/esHelpers/deleteIndiceIx.js'),
      {refresh}              = require('../../../src/managers/indexManager'),
      document               = require('../../../src/managers/documentManager'),
      mapping                = require('../../../node_modules/co-config/mapping.json'),
      recordsFixtures        = require('./recordsFixtures')
;

before(() => {

  return deleteIndexIx(indices.recordsTest.index)
    .then(() => createIndexNx(indices.recordsTest.index, mapping))
    .then(() => document.index(recordsFixtures, indices.recordsTest.index))
    .then(() => refresh(indices.recordsTest.index))
    ;
});

//after(() => deleteIndexIx(indices.recordsTest.index));

describe('duplicatesManager', function() {
  this.timeout(100000);
  describe(
    'updateDuplicateTree(initalRecord (Object), {reportDuplicates (Collection), reportNonDuplicates (Collection)}, {index (String)})',
    () => {
      it('Should report Duplicates accordingly', () => {
        const recordA = _.find(recordsFixtures, {idConditor: 'a'}),
              recordC = _.find(recordsFixtures, {idConditor: 'c'})
        ;
        return updateDuplicatesTree(recordA, {reportDuplicates: [recordC]}, {index: indices.recordsTest.index})
          .then((result) => console.dir(result));
      });
    });
});
