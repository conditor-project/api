'use strict';

const config = require('config-component').get(module);

Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

const
  cluster             = require('cluster'),
  express             = require('express'),
  app                 = express(),
  {security}          = require('config-component').get(module),
  myColors            = require('../helpers/myColors'), // jshint ignore: line
  elasticContainer    = require('../helpers/clients/elastic'),
  {logInfo, logError} = require('../helpers/logger'),
  helmet              = require('helmet'),
  morgan              = require('../middlewares/morgan'),
  semver              = require('semver'),
  errorHandler        = require('../middlewares/errorHandler'),
  resConfig           = require('../middlewares/resConfig'),
  httpMethodsHandler  = require('../middlewares/httpMethodsHandler'),
  compression         = require('compression'),
  _                   = require('lodash'),
  state               = require('../helpers/state')
;

elasticContainer.startAll();

// We get app state from the master
state.assign(process.env.state || {});

const
  // Routers
  root     = require('../controllers/root'),
  records  = require('../controllers/records'),
  scroll   = require('../controllers/scroll'),
  firewall = require('./firewall')
;

const clusterId = cluster.isWorker ? `Worker ${cluster.worker.id}` : 'Master';
let server;


module.exports = app;

app._close = () => {
  server.close();
  logInfo(clusterId.bold, `: server closed`);
};

server = app.listen(
  config.express.api.port,
  config.express.api.host,
  () => {
    logInfo(clusterId.bold,
            `: server listening on `,
            `${config.express.api.host + ':' + config.express.api.port}`.bold.success);
  }
);

app.set('etag', false);
app.set('json spaces', 2);
app.set('trust proxy', _.get(security, 'reverseProxy', false));
app.use(resConfig, httpMethodsHandler);
app.use(helmet({noSniff: false}), morgan);
app.use(compression());
app.get('/', (req, res) => {res.redirect(`/v${semver.major(config.app.version)}`);});
app.use(`/v${semver.major(config.app.version)}`, root, firewall, scroll, records);
app.use(errorHandler);

