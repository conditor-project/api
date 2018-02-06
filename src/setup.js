'use strict';
const configComponent = require('config-component');


exports.setup = setup;

// all action taken before application starts
function setup (cb) {
  configComponent.view();

  return cb();
}
