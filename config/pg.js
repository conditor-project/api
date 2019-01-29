'use strict';

const {pg: {clients: {main}}} = require('config-component').get(module);

module.exports = {
  'development': {
    'username': main.username,
    'password': main.password,
    'database': main.database,
    'host'    : main.host,
    'dialect' : 'postgres'
  },
  'test'       : {
    'username': main.username,
    'password': main.password,
    'database': main.database,
    'host'    : main.host,
    'dialect' : 'postgres'
  },
  'production' : {
    'username': main.username,
    'password': main.password,
    'database': main.database,
    'host'    : main.host,
    'dialect' : 'postgres'
  }
};
