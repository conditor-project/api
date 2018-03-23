'use strict';

const
  cluster = require('cluster')
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
  .catch((reason)=>{throw reason;})
;
