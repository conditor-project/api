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
  httpMethodsHandler = require('../middlewares/httpMethodsHandler'),
  compression        = require('compression')
;

elasticContainer.startAll();

const
  root    = require('../controllers/root'),
  records = require('../controllers/records')
;

let server;

Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

module.exports = app;

app._close = ()=>{
  server.close();
};

server = app.listen(
  config.express.api.port,
  config.express.api.host,
  () => {
    const clusterId = cluster.isWorker ? `Worker ${cluster.worker.id}` : 'Master';
    logInfo(clusterId.bold,
            `: server listening on `,
            `${config.express.api.host + ':' + config.express.api.port}`.bold.success);
  }
);

app.set('etag', false);
app.set('json spaces', 2);
app.use(resConfig, httpMethodsHandler);
app.use(helmet({noSniff: false}), morgan);
app.use(compression());
app.use(`/v${semver.major(config.app.version)}`, root, records);
app.use(errorHandler);

