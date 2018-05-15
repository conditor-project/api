'use strict';

const express             = require('express'),
      router              = express.Router(),
      recordsManager      = require('../src/manager/scrollManager'),
      {getResultHandler, getErrorHandler} = require('../src/resultHandler'),
      firewall            = require('../src/firewall')
;

router.use(firewall);

module.exports = router;

// /scroll/scroll_id={SCROLL_ID}?scroll={DurationString}
router.get('/scroll/:scrollId', (req, res) => {

  recordsManager
    .scroll(req.params.scrollId, req.query)
    .then(getResultHandler(res))
    .then(({result}) => res.json(result))
    .catch(getErrorHandler(res))
  ;
});
