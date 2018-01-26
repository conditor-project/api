'use strict';

const config           = require('config-component').get(),
      _                = require('lodash'),
      elasticsearch    = require('elasticsearch'),
      clientsContainer = {}
;

let started = false;

module.exports.get       = get;
module.exports.startAll  = startAll;
module.exports.stopAll   = stopAll;
module.exports.isStarted = isStarted;


function get () {
  return clientsContainer;
}


function startAll () {
  if (started) return this;
  started = true;
  _.transform(config.elastic.clients,
              (container, client, clientName) => {
                container[clientName] = new elasticsearch.Client(_.cloneDeep(client));
              },
              clientsContainer
  );

  return this;
}

function stopAll () {
  started = false;
  _.forOwn(clientsContainer, (client) => {client.close();});

  return this;
}

function isStarted () {
  return started;
}
