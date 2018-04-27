'use strict';

const
  cluster             = require('cluster'),
  {logError, logInfo} = require('./helpers/logger')
;

const
  setup  = require('./src/setup').setup,
  nbCpus = require('os').cpus().length
;

setup()
  .then(() => {
    cluster.setupMaster({exec: './src/worker.js'});
    for (let i = 0; i < nbCpus; ++i) {
      cluster.fork();
    }
  })
  .catch((reason) => {throw reason;})
;

cluster.on('exit', function(worker, code, signal) {
  if (code) {
    logError(`Worker: ${worker.id} died, code ${code}`);
  } else {
    logInfo(`Worker: ${worker.id} died, code ${signal || code}`);
  }
});
