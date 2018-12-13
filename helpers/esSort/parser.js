'use strict';

const peg  = require('pegjs'),
      fs   = require('fs'),
      path = require('path')
;

const sortGrammar = fs.readFileSync(path.join(__dirname, 'sort.grammar'), 'utf8'),
     laxeJsonGrammar = fs.readFileSync(path.join(__dirname, '../laxeJson/laxeJson.grammar'), 'utf8'),
      parser      = peg.generate(sortGrammar + '\n' + laxeJsonGrammar);

module.exports.parse = _parse;

function _parse (sortQuery) {
  try {
    return parser.parse(sortQuery);
  } catch (err) {
    err.isPeg = true;
    err.label = 'Elastic sort grammar';
    throw err;
  }
}
