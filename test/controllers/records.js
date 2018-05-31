'use strict';

const request  = require('supertest'),
      app      = require('../../src/worker'),
      unzipper = require('unzipper'),
      should   = require('should')
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
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
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
              .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
              .expect(200)
              .expect('Content-Type', /json/)
              .expect('Scroll-Id', /[A-Za-z0-9]+/)
              .then(function(res) {
                scrolledResultCount += +res.get('x-result-count');
                scrollId = res.get('scroll-id'); // @see https://discuss.elastic.co/t/scroll-id-is-not-changing-while-querying/106202
                const print = scrolledResultCount + '/' + res.get('x-total-count');
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

  describe('/zip', function() {
    this.timeout(300000);
    it('Should respond with a ZIP including all records.json', function(done) {
      request(app)
        .get('/v1/records/hal/duplicate/zip?includes=idConditor')
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect(200)
        .expect('Content-Type', 'application/zip')
        .buffer(true)
        .parse((res, cb) => {
          const entries = [];
          console.info('\n');
          res
            .pipe(unzipper.Parse())
            .on('error', (err) => {
              return cb(err, res);
            })
            .on('entry', (entry) => {
              entries.push(entry.path);
              const print = entries.length + '/' + res.headers['x-total-count'];
              console.info('\u001b[1A\u001b[1K\t' + print);
              entry.autodrain();
            })
            .on('finish', function() {
              return cb(null, entries);
            })
          ;
        })
        .end(function(err, res) {

          (+res.get('X-total-count')).should.be.equal(res.body.length);
          return done(err);

        });
    });
  });

})
;
