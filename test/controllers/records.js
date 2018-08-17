'use strict';

const request             = require('supertest'),
      yauzl               = require('yauzl'),
      should              = require('should'), // jshint ignore:line
      app                 = require('../../src/worker'),
      {logInfo, logError} = require('../../helpers/logger')
;

describe('GET /records', function() {
  this.timeout(100000);
  after(function() {
    app._close();
  });
  describe('?scroll={DurationString}&size={Number}', function() {
    it('Should iteratively respond with JSON results and Header/Scroll-Id', function(done) {
      const requestUrl = '/v1/records?scroll=5m&size=1000&includes=idConditor,titre&excludes=titre.value';
      logInfo('Request on: ' + requestUrl);
      request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('Scroll-Id', /[A-Za-z0-9]+/)
        .end(function(err, res) {
          if (err) return done(err);
          let scrollId = res.header['scroll-id'];
          let scrolledResultCount = +res.header['x-result-count'];
          console.info('\tScrolled/Total\n');

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
    it('Should respond with a ZIP including records.json', function(done) {
      const requestUrl = '/v1/records/hal/2014/duplicate/near_duplicate/zip?q=author:jean&includes=idConditor';
      logInfo('Request on: ' + requestUrl);
      request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect(200)
        .expect('Content-Type', 'application/zip')
        .buffer()
        .parse(function binaryParser (res, cb) {
          const entries = [];
          let print = 'RESPONSE STREAM: ';
          let i = 0;
          res.setEncoding('binary');
          res.data = '';
          console.info('\n');

          res.on('data', function(chunk) {
            if (i >= 10000) print += '-';
            if (print.length >= 10) print = 'RESPONSE STREAM: ';
            ++i;
            console.info('\u001b[1A\u001b[1K\t' + print + i);
            res.data += chunk;
          });

          res.on('end', function() {
            yauzl.fromBuffer(
              new Buffer(res.data, 'binary'),
              {lazyEntries: true},
              (err, zipfile) => {
                if (err) return cb(err);

                zipfile.readEntry();

                zipfile.on('entry', (entry) => {
                  entries.push(entry.path);
                  const print = 'UNZIP: ' + entries.length + '/' + res.headers['x-total-count'];
                  console.info('\u001b[1A\u001b[1K\t' + print);
                  zipfile.readEntry();
                });

                zipfile.on('end', () => {
                  cb(null, entries);
                });

              });
          });
        })
        .end(function(err, res) {
          (res.body.length).should.be.equal(+res.get('X-total-count'));
          return done(err);
        });
    });
  });

})
;
