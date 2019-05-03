'use strict';

const {security: {jwt: jwtConfig}, app} = require('config-component').get(module),
      jwt                               = require('jsonwebtoken'),
      nanoid                            = require('nanoid')
;

const jwtToken = module.exports;

jwtToken.generate = ({jwtId, sub} = {}) => {
  if (sub && !(typeof sub === 'string' && !sub.startwith('mailto:'))) throw new Error(
    '"sub" must be an email adresse prefixed by "mailto:"');

  return jwt.sign(
    {},
    jwtConfig.secret,
    {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn,
      issuer   : app.name,
      subject  : sub || 'mailto:user@conditor.fr',
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
