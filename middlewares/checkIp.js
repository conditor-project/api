'use strict';


var
  _         = require('lodash'),
  authRedis = require('../authRedis')
;


module.exports = checkIp;

function checkIp (req, res, next) {
  req.reliableIp = getReliableIp(req);
  authRedis.checkIp(req.reliableIp, (err, result) => {
    if (err || !result) return res.status(503).send();
    req.istex.ip.credential = result;
    next();
  });
}


/**
 * Cherche une Ip fiable
 * @return {String} Adresse IP de l'utilisateur
 */
function getReliableIp (req) {
  const ipPattern     = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  var
        reliableIp,
        remoteAddress = req.connection.remoteAddress,
        xForwardedFor = req.get('x-forwarded-for') || ''
  ;

  if (!['193.54.109.51', '193.54.109.52','127.0.0.1','::ffff:127.0.0.1'].includes(remoteAddress)) {
    console.info('[' + new Date() + '] reliableAddress : ' + remoteAddress + ', pile x-forwarded-for: ' + xForwardedFor);
    return remoteAddress;
  }

  reliableIp = _(xForwardedFor).split(',').last().trim();

  if (!(reliableIp && reliableIp.match(ipPattern))) {
    reliableIp = remoteAddress;

    // IPv6
    // @note ~-1 is 0
    if (reliableIp.includes('ffff')) {
      reliableIp = _(reliableIp).split(':').last().trim();
    }
  }
  console.info('[' + new Date() + '] remoteAddress : ' + remoteAddress + ', pile x-forwarded-for: ' + xForwardedFor + ',reliableIP: '+ reliableIp);

  return reliableIp;
}
