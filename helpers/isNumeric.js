'use strict';

module.exports = function _isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};
