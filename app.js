'use strict';

const
  cluster = require('cluster')
;

const
  config = require('config-component').get(),
  setup  = require('./src/setup').setup,
  nbCpus = require('os').cpus().length
;

Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

setup((err) => {
  if (err) throw err;

  cluster.setupMaster({exec: './src/worker.js'});
  for (let i = 0; i < nbCpus; ++i) {
    cluster.fork();
  }
});
