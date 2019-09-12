'use strict';

const
  should                 = require('should'), // jshint ignore:line
  _                      = require('lodash'),
  {indices}              = require('config-component').get(module),
  {updateDuplicatesTree} = require('../../../src/managers/duplicatesManager'),
  createIndexNx          = require('../../../helpers/esHelpers/createIndiceNx'),
  deleteIndexIx          = require('../../../helpers/esHelpers/deleteIndiceIx.js'),
  {refresh}              = require('../../../src/managers/indexManager'),
  document               = require('../../../src/managers/documentManager'),
  mapping                = require('../../../node_modules/co-config/mapping.json'),
  recordsFixtures        = require('./../../data/recordsFixtures')
;


describe('duplicatesManager', function() {
  this.timeout(100000);
  before(() => {

    return deleteIndexIx(indices.recordsTest.index)
      .then(() => createIndexNx(indices.recordsTest.index, mapping))
      .then(() => document.index(recordsFixtures, indices.recordsTest.index))
      .then(() => refresh(indices.recordsTest.index))
      ;
  });

  after(() => deleteIndexIx(indices.recordsTest.index));

  describe(
    'updateDuplicateTree(initalRecord (Object),reports (Object) {reportDuplicates (Collection), reportNonDuplicates (Collection)},options (object){index (String)})',
    () => {
      it('Should update Duplicates accordingly', () => {
        const recordA = _.find(recordsFixtures, {idConditor: 'a'}),
              recordC = _.find(recordsFixtures, {idConditor: 'c'}),
              recordL = _.find(recordsFixtures, {idConditor: 'l'}),
              recordY = _.find(recordsFixtures, {idConditor: 'y'})
        ;
        return updateDuplicatesTree(recordA,
                                    {reportDuplicates: [recordC], reportNonDuplicates: [recordL, recordY]},
                                    {index: indices.recordsTest.index})
          .then((result) => {
            result.updated.should.equal(8);
          });
      });
    });
});
