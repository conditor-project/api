'use strict';

const
  config    = require('config-component').get(module),
  moment    = require('moment'),
  _         = require('lodash'),
  trimChars = require('lodash/fp/trimChars')
;

module.exports = queryStringToParams;

function queryStringToParams (queryString) {
  const queryStringToParams = {
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
            mapValue: splitString
          },
          exclude  : {
            mapKey  : _.constant('_sourceExclude'),
            mapValue: splitString
          },
          size     : {
            isValid: _validateSize
          },
          scroll_id: {
            mapKey: _.constant('scrollId')
          }
        }
  ;

  function splitString (value) {
    return _(value)
      .split(',')
      .map(trimChars(' '))
      .value()
      ;
  }

  return _(queryString)
    .pick(_.keys(queryStringToParams))
    .transform((params, value, key, queryString) => {
                 _.invoke(queryStringToParams, [key, 'isValid'], value);

                 const mappedKey =
                         _.has(queryStringToParams, [key, 'mapKey'])
                           ? _.invoke(queryStringToParams, [key, 'mapKey'], key)
                           : key;

                 const mappedValue =
                         _.has(queryStringToParams, [key, 'mapValue'])
                           ? _.invoke(queryStringToParams, [key, 'mapValue'], value)
                           : value
                 ;

                 _.invoke(queryStringToParams, [key, 'transform'], params, value, key, queryString);
                 params[mappedKey] = mappedValue;
               },
               {}
    )
    .value()
    ;
}

function _validateSize (size) {
  if (size > config.elastic.maxSize) throw sizeTooHighException(size, config.elastic.maxSize);
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
