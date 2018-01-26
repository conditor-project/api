'use strict';

const
  express  = require('express'),
  cluster  = require('cluster'),
  app      = express(),
  myColors = require('../helpers/myColors'), // jshint ignore: line
  helmet  = require('helmet'),
  morgan  = require('./../middlewares/morgan'),
  errorHandler       = require('./../middlewares/errorHandler'),
  elasticContainer   = require('../helpers/clients/elastic'),
  config   = require('config-component').get(),
  _        = require('lodash')
;
console.log(elasticContainer.startAll().get())
const
  root = require('../controllers/root'),
  document = require('../controllers/document')
;

let server;

Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

server = app.listen(
  config.express.api.port,
  config.express.api.host,
  () => console.info('istex-api server listening on %s:%d'.info, config.express.api.host, config.express.api.port)
);
app.use(helmet(), morgan);
app.use(root, document);
app.use(errorHandler);

