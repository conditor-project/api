'use strict';
/**
 * Remove expired token from registry
 */
const {security: {jwt: jwtConfig}} = require('config-component').get(),
      jwt                          = require('jsonwebtoken'),
      fs                           = require('fs-extra'),
      _                            = require('lodash')
;

const file = './.jwt/tokenRegistry.json';

fs.readJson(file)
  .then((registry) => {
    if (!_.isArrayLikeObject(registry)) throw new Error('No registry');
    return _.reject(registry, _isExpired);
  })
  .then((registry) => {
    fs.outputJson(file, registry, {spaces: 2});
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


function _isExpired ({token}) {
  try {
    jwt.verify(
      token,
      jwtConfig.secret
    );
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return true;
    }
    throw err;
  }
}
