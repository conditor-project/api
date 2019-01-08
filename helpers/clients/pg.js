'use strict';

const config           = require('config-component').get(module),
      _                = require('lodash'),
      Sequelize        = require('sequelize'),
      clientsContainer = {}
;

const defaultOptions = {
  host            : 'localhost',
  dialect         : 'postgres',
  port            : 5432,
  operatorsAliases: false
};

let _started = false;

module.exports.get = get;
module.exports.startAll = startAll;
module.exports.stopAll = stopAll;
module.exports.isStarted = isStarted;


function get (clientName) {
  if (typeof clientName === 'string') {
    return clientsContainer[clientName];
  }

  return clientsContainer;
}


function startAll () {
// jshint validthis: true
  if (_started) return this;
  _started = true;
  _.transform(config.pg.clients,
              (container, clientOptions, clientName) => {
                const options = _.defaults(clientOptions, defaultOptions);
                container[clientName] = new Sequelize(options);
              },
              clientsContainer
  );

  return this;
}

function stopAll () {
// jshint validthis: true
  _started = false;
  _.forOwn(clientsContainer, (client) => {client.close();});

  return this;
}

function isStarted () {
  return _started;
}
