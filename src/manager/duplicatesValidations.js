'use strict';
const pgClient = require('../../helpers/clients/pg').startAll().get('main'),
      config   = require('configComponent').get(module)
;

const manager = module.exports;

manager.save = save;


function save () {

}
