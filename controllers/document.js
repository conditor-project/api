'use strict';

const express = require('express'),
      router  = express.Router();

router.get('/document/[0-9]', (req, res, next) => {
  res.send('yolo');
});


module.exports = router;
