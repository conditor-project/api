'use strict';

const config           = require('config-component').get(module),
      _                = require('lodash'),
      elasticsearch    = require('elasticsearch'),
      clientsContainer = {}
;

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
  _.transform(config.elastic.clients,
              (container, client, clientName) => {
                container[clientName] = new elasticsearch.Client(_.cloneDeep(client));
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
