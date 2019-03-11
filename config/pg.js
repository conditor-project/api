'use strict';

const {pg: {clients: {main}}} = require('config-component').get(module);
const _ = require('lodash');

const defaultOptions = {
  host            : 'localhost',
  dialect         : 'postgres',
  port            : 5432,
  operatorsAliases: false
};

module.exports = {
  'development': _.defaults(main, defaultOptions),
  'test'       : _.defaults(main, defaultOptions),
  'production' : _.defaults(main, defaultOptions)
};
