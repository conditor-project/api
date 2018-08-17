'use strict';

const parser      = require('lucene-query-parser'),
      bodybuilder = require('bodybuilder'),
      esb         = require('elastic-builder/src'),
      _           = require('lodash')
;

const queryBuilder = module.exports;


queryBuilder.filter = filter;

function filter (luceneQuery) {
  const expressionTree = parser.parse(luceneQuery);

  return build(expressionTree).build();
}

const bodyBuilderMapping = {
  'OR'        : {method: 'orFilter'},
  'AND'       : {method: 'andFilter'},
  '<implicit>': {method: 'orFilter'}
};

function build (expressionTree, _bodyBuilder = bodybuilder(), operator = '<implicit>') {
  console.log('------  expression tree -------');
  console.dir(expressionTree, {depth:10})


  if (isNodeExpression(expressionTree)) {
    if (_.has(expressionTree, 'left')) {
      build(expressionTree.left, _bodyBuilder, expressionTree.operator);
    }
    if (_.has(expressionTree, 'right')) {
      build(expressionTree.right, _bodyBuilder, expressionTree.operator);
    }

    return _bodyBuilder;
  }
  if (isFieldExpression(expressionTree)) {
    _.invoke(_bodyBuilder,
             _.get(bodyBuilderMapping, operator + '.method'),
             'term',
             expressionTree.field,
             expressionTree.term
    );

    return _bodyBuilder;
  }

  return _bodyBuilder;
}

function isFieldExpression (expressionTree) {
  return _.chain(expressionTree)
          .keys()
          .intersection(['field', 'term'])
          .size()
          .gte(2)
          .value()
    ;
}

function isNodeExpression (expressionTree) {
  return _.chain(expressionTree)
          .keys()
          .intersection(['left', 'operator', 'right'])
          .size()
          .gte(1)
          .value()
    ;
}

function isRangeExpression (expressionTree) {
  return _.chain(expressionTree)
          .keys()
          .intersection(['field', 'term_min', 'term_max'])
          .size()
          .gte(3)
          .value()
    ;
}
