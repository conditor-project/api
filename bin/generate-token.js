#!/usr/bin/env node

'use strict';

const {security: {jwt: jwtConfig}} = require('config-component').get(),
      jwt                          = require('jsonwebtoken'),
      fs                           = require('fs-extra'),
      {generate}                   = require('../src/jwtToken')
;
const file = './.jwt/tokenRegistry.json';

const token = generate();

fs.readJson(file)
  .then((registry) => {
    registry.push(_buildRegistration(token));
    return registry;
  })
  .catch((err) => {
    if (err.code === 'ENOENT') {
      return [_buildRegistration(token)];
    }
    console.error(err);
    process.exit(1);
  })
  .then((json) => {
    fs.outputJson(file, json, {spaces: 2});
  });

function _buildRegistration (token) {
  const decoded = jwt.verify(
    token,
    jwtConfig.secret
  );

  return {
    token,
    creation  : (new Date(decoded.iat * 1000)).toLocaleString(),
    expiration: (new Date(decoded.exp * 1000)).toLocaleString(),
    jwtid     : decoded.jti
  };
}
