'use strict';

const request = require('supertest'),
      app     = require('../../src/worker'),
      Promise = require('bluebird')
;

let promiseWhile = function(condition, action) {
  var resolver = Promise.defer();

  var loop = function() {
    if (!condition()) return resolver.resolve();
    return Promise.cast(action())
                  .then(loop)
                  .catch(resolver.reject);
  };

  process.nextTick(loop);

  return resolver.promise;
};

describe('GET /records', function() {
  this.timeout(100000);
  after(function() {
    app._close();
  });

  it('respond with JSON', function(done) {
    request(app)
      .get('/v1/records/hal/1999?scroll=5m&size=2&includes=idConditor')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Scroll-Id', /[A-Za-z0-9]+/)
      .end(function(err, res) {
        if (err) return done(err);
        console.log(res.get['scroll-id'])
        let scrollId = res.header['scroll-id'];
        let scrolledResultCount = res.header['x-result-count'];
        console.log(scrollId, scrolledResultCount, res.get['content-type']);
        promiseWhile(() => {
                       return res.header['X-Total-Count'] > scrolledResultCount;
                     },
                     () => {
                       return request(app)
                         .get(`/v1/records?scroll_id=${scrollId}&scroll=5m`)
                         .expect(200)
                         .expect('Content-Type', /json/)
                         .expect('Scroll-Id', /[A-Za-z0-9]+/)
                         .then(function(res) {
                           console.log(scrollId, scrolledResultCount);
                           scrolledResultCount += res.header['X-Result-Count'];
                           scrollId = res.header['scroll-id'];
                         })
                         .catch(done);
                     }
        ).then(() => {done();});


      });
  });
});
