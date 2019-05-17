'use strict';

const express                             = require('express'),
      router                              = express.Router(),
      records                             = require('../src/managers/scrollManager'),
      {getResultHandler, getErrorHandler} = require('../src/resultHandler'),
      validateQueryString                 = require('../helpers/validateQueryString'),
      getInvalidOptionsHandler            = require('../src/getInvalidOptionsHandler')
;


module.exports = router;

// /scroll/scroll_id={SCROLL_ID}?scroll={DurationString}
router.get('/scroll/:scrollId', (req, res) => {
  validateQueryString(req.query, records.scroll.options, 'access_token', 'debug')
    .then(getInvalidOptionsHandler(res))
    .then((query) => {
      records
        .scroll(req.params.scrollId, query)
        .then(getResultHandler(res))
        .then(({result}) => res.json(result))
        .catch(getErrorHandler(res))
      ;
    });
});
