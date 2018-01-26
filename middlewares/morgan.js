'use strict';
const morgan            = require('morgan'),
      config            = require('config-component').get(),
      fileStreamRotator = require('file-stream-rotator'),
      fs                = require('fs'),
      path              = require('path')
;


let accessLogStream =
      fileStreamRotator.getStream({
                                    filename   : path.join(config.log.path, `${config.app.name}-%DATE%.log`),
                                    frequency  : 'daily',
                                    verbose    : false,
                                    date_format: 'YYYY-MM-DD'
                                  });

// apache like logs
const logSyntax =
        ':remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

module.exports = morgan(logSyntax, {stream: accessLogStream});

/*************************************************************************
 * Gestion de la rotation du lien conditor-api.log vers conditor-api-%DATE%.log
 *************************************************************************/
const shortLogPath = path.join(config.log.path, `${config.app.name}.log`);
var currentLogPath;

var getCurrentLogPath = function() {
  let shortISODate = (new Date()).toISOString().substring(0, 10);
  return path.join(config.log.path, `${config.app.name}-${shortISODate}.log`);
};
//création du lien hard "conditor-api.log" vers le fichier courant
var updateLink = function() {
  currentLogPath = getCurrentLogPath();
  if (!fs.existsSync(shortLogPath) && currentLogPath !== undefined) {
    console.info('création du lien hard "conditor-api.log" vers %s', currentLogPath);
    fs.linkSync(currentLogPath, shortLogPath, 'file');
  }
};
updateLink();

//Maj péridique du lien vers le fichier de log courant
setInterval(function() {
  console.info('start periodic logfile link update');

  //suppression du lien hard s'il existe déjà et que ce n'est pas le courant
  currentLogPath = getCurrentLogPath();

  if (fs.existsSync(shortLogPath)) {
    // on évite de supprimer le fichier courant s'il a moins d'une minute
    const linkStats = fs.statSync(shortLogPath);
    const msTimeFromNow = Date.now() - linkStats.ctime;
    // et on ne le fait que si la date du fichier courant est différente de la date actuelle
    // (sinon, au démarrage de l'API, chaque fork va le supprimer/recréer
    const currentShortIsoDate = (new Date()).toISOString().substring(0, 10);
    const logShortIsoDate = (new Date(linkStats.ctime)).toISOString().substring(0, 10);
    if (currentShortIsoDate !== logShortIsoDate && msTimeFromNow > 60000) {
      fs.unlinkSync(shortLogPath);
    }
  }

  //création du lien hard "conditor-api.log" vers le fichier courant
  updateLink();
}, 5 * 60 * 1000);


