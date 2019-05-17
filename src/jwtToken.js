'use strict';

const {security: {jwt: jwtConfig}, app} = require('config-component').get(module),
      jwt                               = require('jsonwebtoken'),
      nanoid                            = require('nanoid'),
      email                             = require('./emailValidator')
;

const jwtToken = module.exports;

// @see https://tools.ietf.org/html/rfc7519#section-4.1.2

jwtToken.generate = ({jwtId, sub} = {}) => {

  email.assert(sub);

  return jwt.sign(
    {},
    jwtConfig.secret,
    {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn,
      issuer   : app.name,
      subject  : sub ? `mailto:${sub}` : 'mailto:user@conditor.fr',
      jwtid    : jwtId || nanoid()
    }
  );
};

jwtToken.verify = (token) => {
  return jwt.verify(token,
                    jwtConfig.secret,
                    {issuer: app.name, algorithms: jwtConfig.algorithm}
  );
};

jwtToken.isExpiredOrInvalid = (token) => {
  try {
    jwtToken.verify(token);
  } catch (err) {
    if (['TokenExpiredError', 'JsonWebTokenError'].includes(err.name)) {
      return true;
    }
    throw err;
  }
  return false;
};
