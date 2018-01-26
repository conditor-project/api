'use strict';


const express = require('express'),
      router  = express.Router();

router.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Conditor');
});


module.exports = router;
