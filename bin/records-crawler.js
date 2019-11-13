#!/usr/bin/env node

'use strict';


const fs                 = require('fs-extra'),
      program            = require('commander'),
      myColors           = require('../helpers/myColors')
;


program
  .version('0.1.0')
  .option('-i, --input <path>', 'Set input file path. Must be a JSON file')
  .action((options) => {crawl(options.input);})
  .parse(process.argv)
;

function crawl(input){
  fs.readJson(input)
    .then((inputJson)=>{
    console.dir(inputJson)
    })
    .catch((reason)=>{throw reason;});
}
