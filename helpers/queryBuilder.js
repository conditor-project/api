'use strict';

const parser      = require('lucene-query-parser'),
      bodybuilder = require('bodybuilder'),
      _           = require('lodash')
;

const queryBuilder = module.exports;


queryBuilder.filter = filter;


const transformMapping = {
  'left': {'method': {'name': 'filter'}}
};

function filter (luceneQuery) {
  const queryTree = parser.parse(luceneQuery);
  console.log('------------------------------');
  const builder = _transform(queryTree, bodybuilder());
  const body = builder.build();
  console.log('+++++++++++++++++++++++++++++');
  console.dir(body, {depth:10});
}

function _transform (queryTree, bodyBuilder) {
  console.log('TREE --------------------------');
  console.dir(queryTree)
  console.log('------------------------------');
   return _.transform(
    queryTree,
    (builder, value, key) => {
      console.log(value, key);
      const mapping = _.get(transformMapping, key, {});
      _.invoke(builder, _.get(mapping, 'method.name'), 'term', value.field, value.term);
      if (value.left) _transform(value, builder);
    },
    bodyBuilder)
  ;
}

