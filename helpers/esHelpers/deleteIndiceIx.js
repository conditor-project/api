'use strict';


const esClient = require('../clients/elastic').startAll().get('main')
;

module.exports = function deleteIndiceIx (indiceName) {
    return esClient
      .indices
      .exists({index: indiceName})
      .then((doesExist) => {
        if (!doesExist) return doesExist;
        return esClient
          .indices
          .delete({index: indiceName})
          ;
      });
};
