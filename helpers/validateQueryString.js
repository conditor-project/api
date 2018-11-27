'use strict';
const _ = require('lodash');

module.exports = validateQueryString;

function validateQueryString (query, ...validFields) {
  return Promise
    .resolve()
    .then(() => {
      validFields = _.flattenDeep(validFields);
      const
        queryStringFields = _.keys(query),
        invalidOptions    = _.difference(queryStringFields, validFields),
        result            = {query}
      ;

      if (invalidOptions.length) {
        const validOptions = _.intersection(queryStringFields, validFields);
        result.invalidOptions = invalidOptions;
        result.query = _.pick(query, validOptions);
      }

      return result;
    });
}

function invalidOptionsException (invalidOptions) {
  let err = new Error('InvalidOptionsException');
  err.name = 'InvalidOptionsException';
  err.invalidOptions = invalidOptions;
  return err;
}
