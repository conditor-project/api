'use strict';

const peg  = require('pegjs'),
      fs   = require('fs'),
      path = require('path')
;

const aggsGrammar = fs.readFileSync(path.join(__dirname, 'aggregation.grammar'), 'utf8'),
      parser      = peg.generate(aggsGrammar);

module.exports.parse = _parse;

function _parse (aggsQuery) {
  try {
    return parser.parse(aggsQuery);
  } catch (err) {
    err.isPeg = true;
    throw err;
  }
}
