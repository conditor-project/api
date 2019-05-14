'use strict';

const splitList = require('../../helpers/splitList'),
      should    = require('should') // jshint ignore:line
;

const stringList = `id  ,source    ,
                          sourceId,
                         s ourceUid,
                        dup
                        licates,
                        nearDuplicates,
                        chainId,`;

const expected = ['id',
                  'source',
                  'sourceId',
                  's ourceUid',
                  'dup\n                        licates',
                  'nearDuplicates',
                  'chainId']
;

describe(`splitList([string=''])`, () => {
  it('should split comma separated string into list(Array)', () => {
    const list = splitList(stringList);
    list.should.deepEqual(expected);
  });

  it('should wrap/cast to String non string arguments', () => {
    let list = splitList(4565);
    list.should.deepEqual(['4565']);

    list = splitList({});
    list.should.deepEqual([{}.toString()]);

    list = splitList([]);
    list.should.deepEqual([]);

    list = splitList();
    list.should.deepEqual([]);

    list = splitList(null);
    list.should.deepEqual([]);

  });
});
