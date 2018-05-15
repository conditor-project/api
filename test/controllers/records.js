'use strict';

const request  = require('supertest'),
      app      = require('../../src/worker'),
      unzipper = require('unzipper')
;

describe('GET /records', function() {
  this.timeout(100000);
  after(function() {
    app._close();
  });
  describe('?scroll={DurationString}&size={Number}', function() {
    it('Should iteratively respond with JSON results and Header/Scroll-Id', function(done) {
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
              .get(`/v1/scroll/${scrollId}?scroll=5m`)
              .expect(200)
              .expect('Content-Type', /json/)
              .expect('Scroll-Id', /[A-Za-z0-9]+/)
              .then(function(res) {
                scrolledResultCount += +res.header['x-result-count'];
                scrollId = res.header['scroll-id']; // @see https://discuss.elastic.co/t/scroll-id-is-not-changing-while-querying/106202
                const print = scrolledResultCount + '/' + res.header['x-total-count'];
                console.info('\u001b[1A\u001b[1K\t' + print);
                if (+res.header['x-total-count'] > scrolledResultCount) {
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

  describe.skip('/zip', function() {
    it('Should respond with a ZIP including all records.json', function(done) {
      request(app)
        .get('/v1/records/zip?includes=idConditor')
        .expect(200)
        .expect('Content-Type', 'application/zip')
        .buffer(true)
        .parse((res, cb) => {
          const entries = [];

          res
            .pipe(unzipper.Parse())
            .on('error', (err) => {
              return cb(err, res);
            })
            .on('entry', (entry) => {
              entries.push(entry.path);
              entry.autodrain();
              //console.log('\u001b[1A\u001b[1K\t' + entries.length);

            })
            .on('finish', function() {
              console.log('finished')
              return cb(null, entries);
            })
          ;
        })
        .end(function(err, res) {
         console.dir(res)
          return done(err);

        });
    });
  });

})
;
