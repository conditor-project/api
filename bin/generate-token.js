#!/usr/bin/env node

'use strict';

const fs                 = require('fs-extra'),
      program            = require('commander'),
      {generate, verify} = require('../src/jwtToken'),
      myColors           = require('../helpers/myColors')
;
const file = './.jwt/tokenRegistry.json';


program
  .version('0.1.0')
  .option('-s, --subject <sub>', 'Set subject field on jwt token. Must be an email address')
  .option('-e, --expiresin <days>', 'Set expiresIn length in days. Must be an integer[1-90]')
  .action((options) => {generateToken(options.subject, options.expiresin);})
  .parse(process.argv)
;


function generateToken (sub, exp) {

  const token = generate({sub, exp}),
        entry = _buildRegistration(token)
  ;

  fs.readJson(file)
    .then((registry) => {
      registry.push(entry);
      return registry;
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return [entry];
      }
      console.error(err);
      process.exit(1);
    })
    .then((json) => {
      fs.outputJson(file, json, {spaces: 2})
        .then(() => {
          console.info('Jwt token generated'.bold.success);
          console.dir(entry);
        });
    });

  function _buildRegistration (token) {
    const decoded = verify(token);

    return {
      token,
      creation  : (new Date(decoded.iat * 1000)).toLocaleString(),
      expiration: (new Date(decoded.exp * 1000)).toLocaleString(),
      subject   : decoded.sub,
      jwtid     : decoded.jti
    };
  }

}
