'use strict';

const
  express            = require('express'),
  app                = express(),
  myColors           = require('../helpers/myColors'), // jshint ignore: line
  helmet             = require('helmet'),
  morgan             = require('./../middlewares/morgan'),
  errorHandler       = require('./../middlewares/errorHandler'),
  elasticContainer   = require('../helpers/clients/elastic'),
  config             = require('config-component').get(),
  resConfig          = require('../middlewares/resConfig'),
  httpMethodsHandler = require('../middlewares/httpMethodsHandler')
;

elasticContainer.startAll();

const
  root     = require('../controllers/root'),
  document = require('../controllers/document')
;

let server;

Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

server = app.listen(
  config.express.api.port,
  config.express.api.host,
  () => console.info('istex-api server listening on %s:%d'.info, config.express.api.host, config.express.api.port)
);
app.set('etag', false);
app.set('json spaces', 2);
app.use(httpMethodsHandler, resConfig);
app.use(helmet({noSniff: false}), morgan);
app.use(root, document);
app.use(errorHandler);

