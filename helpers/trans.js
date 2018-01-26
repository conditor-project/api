'use strict';

module.exports = trans;

const messages = require('./resources/messages.json');

function trans (input) {
  return input && messages[input] || input;
}
