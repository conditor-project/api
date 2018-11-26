'use strict';
const pkg = require('../package.json');
const router = require('express').Router();

router.get('/', (req, res) => {
  res.send(`Bienvenue sur l\'API Conditor - ${pkg.version}`);
});


module.exports = router;
