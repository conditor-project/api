'use strict';

const express                             = require('express'),
      router                              = express.Router(),
      records                             = require('../src/manager/scrollManager'),
      {getResultHandler, getErrorHandler} = require('../src/resultHandler'),
      firewall                            = require('../src/firewall'),
      validateQueryString                 = require('../helpers/validateQueryString'),
      getInvalidOptionsHandler            = require('../src/getInvalidOptionsHandler')
;

router.use(firewall);

module.exports = router;

// /scroll/scroll_id={SCROLL_ID}?scroll={DurationString}
router.get('/scroll/:scrollId', (req, res) => {
  validateQueryString(req.query, records.scroll.options, 'access_token')
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
