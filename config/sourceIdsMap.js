'use strict';

const metadataMappings = require('../node_modules/co-config/metadata-mappings.json'),
      _                = require('lodash')
;

module.exports = {
  sourceIdsMap: _.transform(metadataMappings,
                            (sourceIds, {source, nameID}) => sourceIds[source] = nameID,
                            {})
};
