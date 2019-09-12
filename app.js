'use strict';

const
  cluster             = require('cluster'),
  {logError, logInfo} = require('./helpers/logger')
;

const
  setup  = require('./src/setup').setup,
  nbCpus = require('os').cpus().length,
  state  = require('./helpers/state')
;

setup()
  .then(() => {
    cluster.setupMaster({exec: './src/worker.js'});
    for (let i = 0; i < nbCpus; ++i) {
      cluster.fork({state: JSON.stringify(state.get())});
    }
  })
  .catch((reason) => {
    logError(reason);
    process.exit(1);
  });

cluster.on('exit', function(worker, code, signal) {
  if (code) {
    logError(`Worker: ${worker.id} died, code ${code}`);
  } else {
    logInfo(`Worker: ${worker.id} died, code ${signal || code}`);
  }
});
