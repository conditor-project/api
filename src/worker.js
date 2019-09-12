'use strict';

const config = require('config-component').get(module)
;

// @todo create by worker setup process
Error.stackTraceLimit = config.nodejs.stackTraceLimit || Error.stackTraceLimit;

process.on('unhandledRejection', (reason, p) => {
  logError('Unhandled Rejection at:', p, 'reason:', reason);
  if (config.app.doExitOnUnhandledRejection) {
    process.exit(1);
  }
});

const
  cluster                         = require('cluster'),
  express                         = require('express'),
  app                             = express(),
  myColors                        = require('../helpers/myColors'), // jshint ignore: line
  elasticContainer                = require('../helpers/clients/elastic'),
  {logInfo, logError, logWarning} = require('../helpers/logger'),
  helmet                          = require('helmet'),
  semver                          = require('semver'),
  compression                     = require('compression'),
  _                               = require('lodash'),
  state                           = require('../helpers/state'),
  bodyParser                      = require('body-parser'),
  db                              = require('../db/models/index')
;

elasticContainer.startAll();

// We get app state from the master
state.assign(process.env.state || {});

const
  // Routers / middlewares
  root                  = require('../controllers/root'),
  records               = require('../controllers/records'),
  scroll                = require('../controllers/scroll'),
  duplicatesValidations = require('../controllers/duplicatesValidations'),
  firewall              = require('./firewall'),
  errorHandler          = require('../middlewares/errorHandler'),
  resConfig             = require('../middlewares/resConfig'),
  httpMethodsHandler    = require('../middlewares/httpMethodsHandler'),
  morgan                = require('../middlewares/morgan'),
  notFoundHandler       = require('../middlewares/notFoundHandler')
;

const clusterId = cluster.isWorker ? `Worker ${cluster.worker.id}` : 'Master';

module.exports = app;

let server = startServer();

function startServer () {
  return app.listen(
    config.express.api.port,
    config.express.api.host,
    () => {
      logInfo(clusterId.bold,
              `: server listening on `,
              `${config.express.api.host + ':' + config.express.api.port}`.bold.success);
    }
  );
}


app._start = () => {
  if (server && server.listening) {
    logWarning(clusterId.bold, ': server already started');
    return;
  }
  server = startServer();
  elasticContainer.startAll();
};

app._close = () => {
  server.close(() => {
    logInfo(clusterId.bold, `: server closed`);
    elasticContainer.stopAll();
    db.sequelize.close();
  });
};


app.set('etag', false);
app.set('json spaces', 2);
app.set('trust proxy', _.get(config.security, 'reverseProxy', false));
app.use(helmet({noSniff: false}), morgan);
app.use(bodyParser.json());
app.use(resConfig, httpMethodsHandler);
app.use(compression());
app.get('/', (req, res) => {res.redirect(`/v${semver.major(config.app.version)}`);});
app.use(`/v${semver.major(config.app.version)}`, root);
app.use(`/v${semver.major(config.app.version)}`, firewall, scroll, records, duplicatesValidations);
// This two must be last
app.use(notFoundHandler);
app.use(errorHandler);

