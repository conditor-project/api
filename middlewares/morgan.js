'use strict';
const morgan            = require('morgan'),
      config            = require('config-component').get(module),
      fileStreamRotator = require('file-stream-rotator'),
      fs                = require('fs-extra'),
      path              = require('path'),
      _                 = require('lodash')
;

const accessLogStream =
        fileStreamRotator.getStream({
                                      filename   : path.join(config.log.path, `${config.app.name}-%DATE%.log`),
                                      frequency  : 'daily',
                                      verbose    : false,
                                      date_format: 'YYYY-MM-DD'
                                    });

accessLogStream.on('new', newStreamHandler);

// apache like logs
const logSyntax =
        ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":sid" ":body"';

module.exports = morgan(logSyntax, {stream: accessLogStream});

morgan.token('sid', (req) => {
  return JSON.stringify(req.query.sid);
});

morgan.token('body', (req) => {
  if(_.isEmpty(req.body)) return;

  return JSON.stringify(req.body);
});

/* jshint ignore:start */
async function newStreamHandler (newFilename) {
  const dailyLog = path.join(config.log.path, `${config.app.name}.log`);

  try {
    await fs.unlink(dailyLog);
  } catch (err) {
    if (err && err.code !== 'ENOENT') throw err;
  }

  try {
    await fs.ensureLink(newFilename, dailyLog);
  } catch (err) {
    if (err && err.code !== 'EEXIST') throw err;
  }
}
/* jshint ignore:end */

