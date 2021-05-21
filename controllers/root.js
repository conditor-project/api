'use strict';
const {app} = require('config-component').get(module);
const router    = require('express').Router()
;


router.get('/', (req, res) => {
  res.send(`Bienvenue sur l\'API Conditor Pour l\'interroger : https://github.com/conditor-project/api/blob/master/README.md ou https://wiki.conditor.fr/conditor/index.php/API_nonspec- ${app.version}`);
});


module.exports = router;
