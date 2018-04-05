'use strict';

const {security: {jwt: jwtConfig}, app} = require('config-component').get(),
      jwt                               = require('jsonwebtoken'),
      nanoid                            = require('nanoid')
;

const jwtToken = module.exports;

jwtToken.generate = ({jwtId} = {}) => {
  return jwt.sign(
    {},
    jwtConfig.secret,
    {
      algorithm: 'HS512',
      expiresIn: jwtConfig.expiresIn,
      issuer   : app.name,
      subject  : 'user:anonymous',
      jwtid    : jwtId || nanoid()
    }
  );
};
