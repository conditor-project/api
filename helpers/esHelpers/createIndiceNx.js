'use strict';

const esClient = require('../clients/elastic').startAll().get('main')
;

module.exports = function createIndiceNx (indiceName, indiceConfig) {
    return esClient
      .indices
      .exists({index: indiceName})
      .then((doesExist) => {
        if (doesExist) return doesExist;
        return esClient
          .indices
          .create(
            {
              index: indiceName,
              body : indiceConfig
            }
          );
      });
};
