'use strict';
const trimChars = require('lodash/fp/trimChars'),
      _         = require('lodash')
;

module.exports = splitList;

function splitList (stringList = '') {
  return _(stringList)
    .split(/\s*,\s*/)
    .filter(value => value != null && value !== '')
    .map(trimChars(' '))
    .value()
    ;
}
