'use strict';

const
  {main: esClient}    = require('../../helpers/clients/elastic').startAll().get(),
  {indices}           = require('config-component').get(module),
  esResultFormat      = require('../../helpers/esResultFormat'),
  _                   = require('lodash'),
  queryStringToParams = require('../queryStringToParams'),
  {buildRequestBody}  = require('../documentQueryBuilder')
;

const tasksManager = module.exports;

tasksManager.crawl = crawl;


function crawl(idsMap){

}
