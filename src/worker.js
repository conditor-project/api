'use strict';

const
  cluster            = require('cluster'),
  express            = require('express'),
  app                = express(),
  config             = require('config-component').get(),
  myColors           = require('../helpers/myColors'), // jshint ignore: line
  elasticContainer   = require('../helpers/clients/elastic'),
  logger             = require('../helpers/logger'),
  logInfo            = logger.logInfo,
  logError           = logger.logError,
  helmet             = require('helmet'),
  morgan             = require('../middlewares/morgan'),
  semver             = require('semver'),
  errorHandler       = require('../middlewares/errorHandler'),
  resConfig          = require('../middlewares/resConfig'),
  httpMethodsHandler = require('../middlewares/httpMethodsHandler')
;

elasticContainer.startAll();

const
  root    = require('../controllers/root'),
  records = require('../controllers/records')
;

let server;

Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

server = app.listen(
  config.express.api.port,
  config.express.api.host,
  () => logInfo(`Worker ${cluster.worker.id}`.bold,
                `: server listening on `,
                `${config.express.api.host + ':' + config.express.api.port}`.bold.success)
);

app.set('etag', false);
app.set('json spaces', 2);
app.use(resConfig, httpMethodsHandler);
app.use(helmet({noSniff: false}), morgan);
app.use(`/v${semver.major(config.app.version)}`, root, records);
app.use(errorHandler);

