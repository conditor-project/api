#!/usr/bin/env node

'use strict';

const fs                 = require('fs-extra'),
      {generate, verify} = require('../src/jwtToken')
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
  const decoded = verify(token);

  return {
    token,
    creation  : (new Date(decoded.iat * 1000)).toLocaleString(),
    expiration: (new Date(decoded.exp * 1000)).toLocaleString(),
    jwtid     : decoded.jti
  };
}
