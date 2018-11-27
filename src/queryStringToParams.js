'use strict';

const
  config    = require('config-component').get(module),
  moment    = require('moment'),
  _         = require('lodash'),
  trimChars = require('lodash/fp/trimChars'),
  state     = require('../helpers/state'),
  isNumeric = require('../helpers/isNumeric')
;

module.exports = queryStringToParams;

const paramsMapping = {
        scroll   : {
          isValid  : _validateScrollDuration,
          // @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-scroll.html
          transform: (params, value, key, queryString) => {
            if (!queryString.scroll_id) {
              params.sort = ['_doc:asc'];
              params.trackScores = true;
            }
          }
        },
        include  : {
          mapKey  : _.constant('_sourceInclude'),
          mapValue: _splitString
        },
        exclude  : {
          mapKey  : _.constant('_sourceExclude'),
          mapValue: _splitString
        },
        page_size : {
          isValid    : _validatePageSize,
          mapValue   : Number,
          mapKey     : _.constant('size'),
          hasPriority: true
        },
        page     : {
          isValid : _validatePage,
          mapValue: (page, key, queryString, params) => {
            const size = _.get(params, 'size', 10);
            return (page - 1) * Math.max(size,1);
          },
          mapKey  : _.constant('from')
        },
        scroll_id: {
          mapKey: _.constant('scrollId')
        }
      }
;

const paramsValidation = {
  fromAndSize: _validateMaxResultWindow
};

function queryStringToParams (queryString) {
  const priorKeys = _(paramsMapping).pickBy((mapping) => mapping.hasPriority === true).keys().value();
  // First pass for mapping with hasPriority = true
  let params = _(queryString)
    .pick(priorKeys)
    .transform(_toParams, {})
    .value()
  ;

  // Second pass
  params = _(queryString)
    .pick(_(paramsMapping).keys().difference(priorKeys).value())
    .transform(_toParams, params)
    .value()
  ;
  _.forOwn(paramsValidation, (validator) => {validator(params);});

  return params;
}

function _toParams (params, value, key, queryString) {
  _.invoke(paramsMapping, [key, 'isValid'], value);

  const mappedKey =
          _.has(paramsMapping, [key, 'mapKey'])
            ? _.invoke(paramsMapping, [key, 'mapKey'], key)
            : key;

  const mappedValue =
          _.has(paramsMapping, [key, 'mapValue'])
            ? _.invoke(paramsMapping, [key, 'mapValue'], value, key, queryString, params)
            : value;

  _.invoke(paramsMapping, [key, 'transform'], params, value, key, queryString);
  params[mappedKey] = mappedValue;
}

/*
 * Validators
 */
function _validateMaxResultWindow (params) {
  const resultWindow    = _.get(params, 'size', 10) + _.get(params, 'from', 0),
        maxResultWindow = state.get('indices.records.cachedSettings.maxResultWindow', 10000)
  ;
  if (resultWindow > maxResultWindow) throw maxResultWindowException(resultWindow, maxResultWindow);
}

function _validatePage (page) {
  if (!_isPositiveInteger(page) || page < 1) throw invalidType('page', page, 'Positive Integer > 1');
}

function _validatePageSize (pageSize) {
  if (!_isPositiveInteger(pageSize)) throw invalidType('page_size', pageSize, 'Positive Integer');
  if (pageSize > config.elastic.maxPageSize) throw sizeTooHighException(pageSize, config.elastic.maxPageSize);
}

function _isPositiveInteger (value) {
  return isNumeric(value) && Number.isInteger(+value) && (Math.sign(+value) >= 0);
}

function _validateScrollDuration (durationString) {

  let scrollDuration,
      maxDuration = _convertDurationStringToSecond(config.elastic.maxScrollDuration)
  ;
  try {
    scrollDuration = _convertDurationStringToSecond(durationString);
  } catch (err) {
    // Do nothing and let elastic handle the error of parsing
  }

  if (scrollDuration > maxDuration) throw invalidScrollDurationException(scrollDuration, maxDuration);
}

/*
 * Exceptions
 */
function maxResultWindowException (resultWindow, maxResultWindow) {
  let err = new Error(`Result window(from + size) must be less than ${maxResultWindow}, but get ${resultWindow}`);
  err.name = 'resultWindowException';
  err.status = 400;
  return err;
}

function invalidType (key, value, expectedType) {
  let err = new Error(`The "${key}" parameter expect a ${expectedType} but get ${JSON.stringify(value)}`);
  err.name = 'invalideType';
  err.status = 400;
  return err;
}

function sizeTooHighException (value, maxValue) {
  let err = new Error(`The required size ${value} exceed the maximum  ${maxValue}`);
  err.name = 'sizeTooHighException';
  err.status = 400;
  return err;
}

function invalidScrollDurationException (scrollDuration, maxScrollDuration) {
  let err = new Error(`The required scroll duration ${scrollDuration} exceed the maximum duration ${maxScrollDuration}`);
  err.name = 'invalidScrollDurationException';
  err.status = 400;
  return err;
}

/*
 * Helpers
 */

// @todo look at https://github.com/zeit/ms it would maybe be better to use it
function _convertDurationStringToSecond (durationString) {
  const parsedDuration = _parseDurationString(durationString);
  return moment.duration(+parsedDuration.duration, parsedDuration.unit).asSeconds();
}

function _parseDurationString (durationString) {
  let parsedDuration = {};
  ({1: parsedDuration.duration, 2: parsedDuration.unit} = _.trim(durationString)
                                                           .match(/^(\d+)[ ]*(d|h|m|s|ms|micros|nanos)$/i));
  return parsedDuration;
}

function _escapeLuceneQuery (query) {
  return query.replace(/([\!\*\+\&\|\(\)\[\]\{\}\^\~\?\:\"])/g, '\\$1');
}

function _splitString (value) {
  return _(value)
    .split(',')
    .map(trimChars(' '))
    .value()
    ;
}
