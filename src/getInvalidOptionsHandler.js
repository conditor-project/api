'use strict';
module.exports = getInvalidOptionsHandler;

function getInvalidOptionsHandler (res) {
  return ({invalidOptions, query}) => {
    if (invalidOptions) {
      res.locals.invalidOptions = invalidOptions;
    }
    res.locals.validatedQuery = query;
    return query; // Keep going cause its only a Warning
  };
}
