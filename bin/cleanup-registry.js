#!/usr/bin/env node

'use strict';
/**
 * Remove expired token from registry
 */
const {isExpiredOrInvalid} = require('../src/jwtToken'),
      fs                   = require('fs-extra'),
      _                    = require('lodash')
;

const file = './.jwt/tokenRegistry.json';

fs.readJson(file)
  .then((registry) => {
    if (!_.isArrayLikeObject(registry)) throw new Error('No registry');
    return _.partition(registry, ({token}) => isExpiredOrInvalid(token));
  })
  .then(([invalidTokens, validTokens]) => {
  if(invalidTokens.length){
    console.info('Rejected Tokens: ');
    console.dir(invalidTokens);
  }
    fs.outputJson(file, validTokens, {spaces: 2});
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });



