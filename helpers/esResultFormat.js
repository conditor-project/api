'use strict';

const _     = require('lodash'),
      state = require('./state')
;

const responseFormat = module.exports;

responseFormat.getSingleResult = (response) => {
  if (response.hits.total === 0) throw noResultException();
  if (response.hits.total > 1) throw nonUniqueResultException();

  const resultWrapper = responseFormat.getResult(response);

  if (!_.has(resultWrapper, 'result.aggregations')) {
    resultWrapper.result = _.find(resultWrapper.hits);
  }

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
  const hits         = _.map(response.hits.hits, (hit) => {return _.assign({}, hit._source, {_score: hit._score});}),
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

responseFormat.paginate = (result, from = 0, size = 10) => {
  if (size === 0) return result;

  const page     = Math.floor(from / Math.max(size, 1) + 1),
        lastPage = _.max([_.chain([result.totalCount,
                                   state.get('indices.records.cachedSettings.maxResultWindow', 10000)])
                           .min()
                           .divide(size)
                           .floor()
                           .value(), 1]),
        links    = {}
  ;

  if (page > 1) {
    links.first = {page: 1, page_size: size, rel: 'first'};
    if (page <= lastPage) {
      links.prev = {page: page - 1, page_size: size, rel: 'prev'};
    }
  }

  if (page < lastPage) {
    links.next = {page: page + 1, page_size: size, rel: 'next'};
  }

  if (lastPage > 1) {
    links.last = {page: lastPage, page_size: size, rel: 'last'};
  }

  if (_.size(links)) {
    result.links = links;
  }

  if(result.resultCount < size){
    result.status = 206;
  }

  return result;
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
