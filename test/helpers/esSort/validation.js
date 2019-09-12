'use strict';

const schema = require('../../../helpers/esSort/validation').getSchema(),
      _      = require('lodash'),
      should = require('should'), // jshint ignore:line
      Joi    = require('@hapi/joi')
;

const asts = [
        {
          ast: []
        },
        {
          ast: [{field: 'authors'}]
        },
        {
          ast     : [{field: 'authors', script: 'no script allowed'}],
          expected: 'throw',
          message : 'Should not validate AST'
        },
        {
          ast: [{field: 'authors', order: 'desc', mode: 'avg'}]
        },
        {
          ast     : [{field: 'authors', order: 'desc', mode: 'avggg'}],
          expected: 'throw',
          message : 'Should not validate AST'
        },
        {
          ast: [
            {
              field : 'nearDuplicates.similarityRate',
              nested: {
                path  : 'nearDuplicates',
                nested: {
                  path: 'parent'
                }
              },
              mode  : 'avg',
              order : 'desc'
            },
            {
              field: 'authorNames',
              mode : 'min'
            }]
        }
      ]
;
describe('esSort: Schema validation', () => {
           describe('Joi#assert(value, schema)', () => {
             _.forEach(asts, (test) => {
               describe(`"${JSON.stringify(test.ast)}"`, () => {
                 it(test.message || 'Should validate AST', () => {
                   const expected = 'should.' + (test.expected || 'not.throw');
                   _.invoke((() => Joi.assert(test.ast, schema)), expected);
                 });
               });
             });
           });
         }
);

