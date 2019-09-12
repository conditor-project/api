'use strict';

const app      = require('../src/worker'),
      setupApp = require('../src/setup').setup;

before(function() {
  return setupApp()
    .then(app._start());
});

after(function() {
  app._close();
});
