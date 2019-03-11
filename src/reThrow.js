'use strict';
const _ = require('lodash');

module.exports = reThrow;


const statusErrorMapping = [
  {
    predicate: (err) => {
      return ((err.name === 'SyntaxError' && err.isPeg === true)
              || (err.name === 'ValidationError' && err.isJoi === true));
    },
    status   : 400
  },
  {
    predicate: err => err.name === 'SequelizeUniqueConstraintError' && _.get(err, 'original.table') === 'DuplicatesValidations',
    status: 409
   }
];

function reThrow (err) {
  const mapping = _.find(statusErrorMapping, ({predicate}) => predicate(err));
  if(mapping) err.status = mapping.status;
  throw err;
}
