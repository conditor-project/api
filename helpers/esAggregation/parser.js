'use strict';

const peg  = require('pegjs'),
      fs   = require('fs'),
      path = require('path')
;

const aggsGrammar = fs.readFileSync(path.join(__dirname, 'aggregation.grammar'), 'utf8'),
      laxeJsonGrammar = fs.readFileSync(path.join(__dirname, '../laxeJson/laxeJson.grammar'), 'utf8'),
      parser      = peg.generate(aggsGrammar + '\n' + laxeJsonGrammar);

module.exports.parse = _parse;

function _parse (aggsQuery) {
  try {
    return parser.parse(aggsQuery);
  } catch (err) {
    err.isPeg = true;
    throw err;
  }
}
