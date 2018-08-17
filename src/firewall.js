'use strict';

const express    = require('express'),
      firewall   = express.Router(),
      {security} = require('config-component').get(module),
      {verify}   = require('./jwtToken'),
      jwt        = require('jsonwebtoken'),
      _          = require('lodash'),
      includes   = require('lodash/fp/includes')
;

module.exports = firewall;

firewall.use(authenticate, authorize);

const jwtErrors = // List all JWT module defined errors
        _(jwt)
          .keys()
          .filter(includes('Error'))
          .value();


function authenticate (req, res, next) {
  req.isAuthenticated = false;
  try {
    if (
      authenticateByJwt(req)
      || authenticateByIp(req)
    ) {
      req.isAuthenticated = true;
    }
  } catch (err) {
    if (err.name === 'tokenMethodError') return res.sendStatus(err.status);
    throw err;
  }

  next();
}


function authorize (req, res, next) {
  if (!req.isAuthenticated) {
    res.set('WWW-Authenticate', 'Bearer');
    return res.sendStatus(401);
  }

  next();
}


function authenticateByIp (req) {
  return _.get(security, 'ip.inMemory', []).includes(req.ip);
}

// @see http://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#RFC2617
function authenticateByJwt (req) {
  if (!req.get('Authorization') && !req.query.access_token) return false;
  if (req.get('Authorization') && req.query.access_token || _.isArray(req.query.access_token)) throw tokenMethodError();

  const token = _(req.get('Authorization') || req.query.access_token)
    .split('Bearer ')
    .last();


  try {
    const decoded = verify(token);
    if (_.includes(_.get(security, 'jwt.forbidenIds', []), decoded.jti)) return false;
  } catch (err) {
    if (jwtErrors.includes(err.name)) {
      return false;
    }
    throw err;
  }
  return true;
}

function tokenMethodError () {
  let err = new Error(`Clients MUST NOT use more than one method to transmit the token in each request.`);
  err.name = 'tokenMethodError';
  err.status = 400;
  return err;
}
