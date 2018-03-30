'use strict';

const
      fs                           = require('fs-extra'),
      _                            = require('lodash')
;

const file = './.jwt/tokenRegistry.json';

fs.readJson(file)
  .then((registry) => {
    if (!_.isArrayLikeObject(registry)) throw new Error('No registry');
    console.dir(registry);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
