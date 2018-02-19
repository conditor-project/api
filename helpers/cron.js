'use strict';
const
  _          = require('lodash'),
  logger     = require('./logger'),
  logInfo    = logger.logInfo,
  logError   = logger.logError,
  logWarning = logger.logWarning
;

const cronTable = {}
;

module.exports.get = get;
module.exports.addTask = addTask;
module.exports.removeTask = removeTask;
module.exports.start = start;
module.exports.stop = stop;
module.exports.startAll = startAll;
module.exports.stopAll = stopAll;


function get () {
  return cronTable;
}

// func must accept callback
function addTask (name, func, delay = 3600000) {
  if (cronTable[name]) {
    logWarning(`${'Cron'.warning.bold}: task name already exists, ` + name);
    return this;
  }
  cronTable[name] = {func, delay, name, timeout: null};

  return this;
}


function removeTask (name) {
  if (!cronTable[name]) return this;
  stop(name);
  cronTable[name] = null;

  return this;
}

function start (name) {
  if (!cronTable[name]) return this;
  _recurse(cronTable[name]);

  return this;
}

function stop (name) {
  if (!_.has(cronTable, `${name}.timeout`)) return this;
  clearTimeout(cronTable[name].timeout);
  cronTable[name].timeout = null;

  return this;
}

function startAll () {
  _.each(cronTable, (task, name) => {
    if (task.timeout) return;
    _recurse(task, name);
  });

  return this;
}

function _recurse (task) {
  task.timeout = setTimeout(
    () => {
      task.func((err) => {
        if (err) throw err;
        logInfo(`${'Cron'.success.bold}: task: ${task.name}, func: ${_.get(task,
                                                         'func.name',
                                                         'unset') || 'anonymous'}`);
        _recurse(task);
      });
    },
    task.delay
  );
}

function stopAll () {
  _.each(cronTable, (task) => {
    if (task.timeout) {
      clearTimeout(task.timeout);
      task.timeout = null;
    }
  });

  return this;
}
