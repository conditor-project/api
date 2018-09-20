'use strict';

const _ = require('lodash')
;

const responseFormat = module.exports;

responseFormat.getSingleResult = (response) => {
  if (response.hits.total === 0) throw noResultException();
  if (response.hits.total > 1) throw nonUniqueResultException();

  const resultWrapper = responseFormat.getResult(response);
  resultWrapper.result = _.find(resultWrapper.hits);

  return resultWrapper;
};

responseFormat.getSingleScalarResult = (response) => {
  if (response.hits.total === 0) throw noResultException();
  if (response.hits.total > 1) throw nonUniqueResultException();

  const result = _.get(response, 'hits.hits.0._source', {});
  if (_.size(result) === 0) throw noResultException();
  if (_.size(result) > 1) throw nonUniqueResultException();

  const resultWrapper = responseFormat.getResult(response);
  resultWrapper.result = _.find(result);

  return resultWrapper;
};

responseFormat.getResult = (response) => {
  const hits         = _.map(response.hits.hits, (hit) => {return _.assign({}, hit._source, {score: hit._score});}),
        aggregations = _.get(response, 'aggregations', null)
  ;

  const result = aggregations ? {hits, aggregations} : hits;

  return {
    result      : result,
    hits        : hits,
    totalCount  : _.get(response, 'hits.total', 0),
    resultCount : _.get(response, 'hits.hits.length', 0),
    scrollId    : _.get(response, '_scroll_id', null),
    aggregations: aggregations
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
