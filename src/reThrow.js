'use strict';

module.exports = function reThrow (err) {
  if ((err.name === 'SyntaxError' && err.isPeg === true)
      || (err.name === 'ValidationError' && err.isJoi === true)
  ) {
    err.status = 400;
  }
  throw err;
};
