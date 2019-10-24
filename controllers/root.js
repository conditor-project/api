'use strict';
const {app} = require('config-component').get(module);
const router    = require('express').Router()
;


router.get('/', (req, res) => {
  res.send(`Bienvenue sur l\'API Conditor - ${app.version}`);
});


module.exports = router;
