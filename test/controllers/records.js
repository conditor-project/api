'use strict';

const request = require('supertest'),
      app     = require('../../src/worker')
;


describe('GET /records', function() {
  this.timeout(100000);
  after(function() {
    app._close();
  });
  describe('/{Source}?scroll={DurationString}&size={Number}', function() {
    it('should iteratively respond with JSON results and Header/Scroll-Id', function(done) {
      request(app)
        .get('/v1/records?scroll=5m&size=1000&includes=idConditor,titre&excludes=titre.value')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('Scroll-Id', /[A-Za-z0-9]+/)
        .end(function(err, res) {
          if (err) return done(err);
          let scrollId = res.header['scroll-id'];
          let scrolledResultCount = +res.header['x-result-count'];
          console.log('\tScrolled/Total\n');

          (function scroll () {
            request(app)
              .get(`/v1/records?scroll_id=${scrollId}&scroll=5m`)
              .expect(200)
              .expect('Content-Type', /json/)
              .expect('Scroll-Id', /[A-Za-z0-9]+/)
              .then(function(res) {
                scrolledResultCount += +res.header['x-result-count'];
                scrollId = res.header['scroll-id'];

                const print = scrolledResultCount + '/' + res.header['x-total-count'];
                console.log('\u001b[1A\u001b[1K\t' + print);
                if (res.header['x-total-count'] > scrolledResultCount) {
                  return scroll();
                }
                return done();
              })
              .catch((err) => {done(err);})
            ;
          })();
        });
    });
  });

});
