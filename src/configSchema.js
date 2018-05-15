'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
                                     elastic: {clients: {main: {hosts: Joi.required()}}}
                                   });
