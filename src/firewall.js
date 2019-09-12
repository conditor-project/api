'use strict';

const express    = require('express'),
      firewall   = express.Router(),
      {security} = require('config-component').get(module),
      {verify}   = require('./jwtToken'),
      jwt        = require('jsonwebtoken'),
      _          = require('lodash'),
      includes   = require('lodash/fp/includes'),
      db         = require('../db/models/index')
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
    req.jwtToken = _getJwtToken(req);
    if (
      authenticateByJwt(req.jwtToken)
      || authenticateByIp(req.ip)
    ) {
      req.isAuthenticated = true;
    }
  } catch (err) {
    if (err.name === 'tokenMethodError') return res.sendStatus(err.status);
    return next(err);
  }

  next();
}


function authorize (req, res, next) {
  if (!req.isAuthenticated) {
    res.set('WWW-Authenticate', 'Bearer');
    return res.sendStatus(401);
  }

  let email;
  if (!(email = _getEmail(req))){
    return res.sendStatus(403);
  }

  db
    .Users
    .findOrCreate({where: {email}, defaults: {email}})
    .spread((instance) => {
      req.user = instance;
      return next();
    })
    .catch(next)
  ;
}


function authenticateByIp (ip) {
  return !_.chain(security)
           .get('ip.inMemory', [])
           .find(['ip', ip])
           .isEmpty()
           .value();
}

// @see http://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html
function authenticateByJwt (jwtToken) {
  if (jwtToken == null) return false;

  try {
    const decoded = verify(jwtToken);
    if (_.includes(_.get(security, 'jwt.forbiddenIds', []), decoded.jti)) return false;
  } catch (err) {
    if (jwtErrors.includes(err.name)) {
      return false;
    }
    throw err;
  }

  return true;
}
function _getEmail (req) {
  // get email from in memory ip Users provider.
  if (req.jwtToken == null) {
    return _.chain(security)
            .get('ip.inMemory', [])
            .find(['ip', req.ip])
            .get('email')
            .value();
  }

  // get email from jwt token subject field, which is an Uri formated email.
  return _.chain(verify(req.jwtToken)).get('sub').replace(/^mailto:/, '').value();
}

function _getJwtToken (req) {
  if (!req.get('Authorization') && !req.query.access_token) return null;
  if (req.get('Authorization') && req.query.access_token || _.isArray(req.query.access_token)) throw tokenMethodError();

  return _(req.get('Authorization') || req.query.access_token)
    .split('Bearer ')
    .last();
}

function tokenMethodError () {
  let err = new Error(`Clients MUST NOT use more than one method to transmit the token in each request.`);
  err.name = 'tokenMethodError';
  err.status = 400;
  return err;
}
