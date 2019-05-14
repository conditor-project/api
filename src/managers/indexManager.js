'use strict';

const
  {main: esClient} = require('../../helpers/clients/elastic').startAll().get(),
  _                = require('lodash')
;

const indexManager = module.exports;

indexManager.getSettings = getSettings;
indexManager.refresh = refresh;

function refresh (index) {
  return esClient
    .indices
    .refresh({index})
    ;
}

function getSettings (index, ...includeNames) {
  return esClient
    .indices
    .getSettings({
                   index          : index,
                   includeDefaults: true,
                   name           : includeNames
                 })
    .then((response) => {
      return _formatSettings(response[index]);
    });
}

function _formatSettings (indexSettings) {
  return _.assign(_.get(indexSettings, ['settings', 'index'], {}), _.get(indexSettings, ['defaults', 'index'], {}));
}
