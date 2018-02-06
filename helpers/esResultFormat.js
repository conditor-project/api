'use strict';

const _              = require('lodash'),
      responseFormat = {}
;


module.exports = responseFormat;

responseFormat.getSingleHit = (response) => {
  if (response.hits.total === 0) throw noResultException();
  if (response.hits.total > 1) throw nonUniqueResultException();

  return {
    result: _.get(response, 'hits.hits.0._source'),
    total : _.get(response, 'hits.total')
  };
};

responseFormat.getSingleScalarResult = (response) => {
  if (response.hits.total === 0) throw noResultException();
  if (response.hits.total > 1) throw nonUniqueResultException();

  const result =_.get(response, 'hits.hits.0._source');
  if (_.size(result) === 0) throw noResultException();
  if (_.size(result) > 1) throw nonUniqueResultException();

  return {
    result:  _.find(result),
    total : _.get(response, 'hits.total')
  };
};

responseFormat.getResult = (response) => {
  return {
    result: _.map(response.hits.hits, _.iteratee('_source')),
    total : _.get(response, 'hits.total')
  };
};

function nonUniqueResultException () {
  let err = new Error('NonUniqueResultException');
  err.name = 'NonUniqueResultException';
  return err;
}

function noResultException () {
  let err = new Error('NoResultException');
  err.name = 'NoResultException';
  return err;
}
