'use strict';

const
  cluster = require('cluster')
;

const
  config = require('config-component').get(),
  setup  = require('./src/setup').setup,
  nbCpus = require('os').cpus().length,
  parser           = require('lucene-query-parser')
;
//console.dir(parser.parse('source:wos'), {depth:10})
//console.dir(parser.parse('source:wos AND publiDate:2014 AND isDuplicate:true'), {depth:10})
//console.dir(parser.parse('source:(wos AND hal)'), {depth:10})
//console.dir(parser.parse('source:(wos AND hal) AND publiDate:2014 AND isDuplicate:true'), {depth:10})
Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

setup((err) => {
  if (err) throw err;

  cluster.setupMaster({exec: './src/worker.js'});
  for (let i = 0; i < nbCpus; ++i) {
    cluster.fork();
  }
});
