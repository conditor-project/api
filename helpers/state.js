'use strict';

const _ = require('lodash')
;
let _data = {};

const state = module.exports;

state.get = (path, defaultValue) => {
  if(!path) return _data;
  return _.get(_data, path, defaultValue);
};

state.set = (path, value) => {
  _.set(_data, path, value);
  return this;
};

state.assign= (value) =>{
  if(_.isString(value)){
   value = JSON.parse(value);
  }

  if(!_.isPlainObject(value)) throw new TypeError('Plain Object expected');
  _data = value;
};

