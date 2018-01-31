'use strict';

const _               = require('lodash'),
      responseBuilder = {}
;


module.exports = responseBuilder;

responseBuilder.getSingleHit = (body) => {
  if(body.hits.total ===0) throw noResultException();
  if(body.hits.total > 1) throw nonUniqueResultException();

  return _.get(body, 'hits.hits.0._source');
};


function nonUniqueResultException () {
  let err  = new Error('NonUniqueResultException');
  err.name = 'NonUniqueResultException';
  return err;
}

function noResultException () {
  let err  = new Error('NoResultException');
  err.name = 'NoResultException';
  return err;
}
