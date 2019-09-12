'use strict';

const request   = require('supertest'),
      yauzl     = require('yauzl'),
      should    = require('should'), // jshint ignore:line
      app       = require('../../src/worker'),
      {logInfo} = require('../../helpers/logger'),
      _         = require('lodash'),
      semver    = require('semver'),
      config    = require('config-component').get(module)
;

const apiVersion = `v${semver.major(config.app.version)}`;


describe(`GET /${apiVersion}/records`, function() {
  this.timeout(300000);

  describe('?scroll={DurationString}&page_size={Number}', function() {
    it('Should iteratively respond with JSON results and Header/Scroll-Id', function(done) {
      const requestUrl = `/${apiVersion}/records/_filter/sudoc/duplicate?scroll=5m&include=idConditor,titre&exclude=titre.value`;
      logInfo('Request on: ' + requestUrl);
      request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect('Content-Type', /json/)
        .expect('Scroll-Id', /[A-Za-z0-9]+/)
        .end(function(err, res) {
          if (err) return done(err);
          let scrollId = res.header['scroll-id'];
          let scrolledResultCount = +res.header['x-result-count'];
          console.info('\tScrolled/Total\n');

          (function scroll () {
            request(app)
              .get(`/${apiVersion}/scroll/${scrollId}?scroll=5m`)
              .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
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

  describe('?aggs', function() {
    it('should return aggregations by source', () => {
      const requestUrl = `/${apiVersion}/records?aggs=terms:source`;
      return request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect((res) => {if (res.statusType !== 2) throw new Error(res.status);})
        .expect('Content-Type', /json/)
        .then(response => {
          const aggregations = JSON.parse(response.text).aggregations;
          aggregations.should.have.key('TERMS_SOURCE');
          aggregations['TERMS_SOURCE'].should.have.key('buckets');
          aggregations['TERMS_SOURCE'].buckets.should.Array();
          aggregations['TERMS_SOURCE'].buckets.map(bucket => {
            bucket.should.have.keys('key', 'doc_count');
          });
        });
    });

    it('should return aggregations with a date range', () => {
      const requestUrl = `/${apiVersion}/records?aggs=date_range:creationDate:[2000 to 2018]`;
      return request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect('Content-Type', /json/)
        .then(response => {
          const aggregations = JSON.parse(response.text).aggregations;
          aggregations.should.have.key('DATE_RANGE_CREATION_DATE');
          aggregations['DATE_RANGE_CREATION_DATE'].should.have.key('buckets');
          aggregations['DATE_RANGE_CREATION_DATE'].buckets.should.Array();
          aggregations['DATE_RANGE_CREATION_DATE'].buckets.map(bucket => {
            bucket.should.have.keys('key', 'from', 'from_as_string', 'to', 'to_as_string');
          });
        });
    });

    it('should return aggregations with multiple date range', () => {
      const requestUrl = `/${apiVersion}/records?aggs=date_range:creationDate:[2000 to 2013-05-05][2013-05-05 to 2018][2018 to now]`;
      return request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect('Content-Type', /json/)
        .then(response => {
          const aggregations = JSON.parse(response.text).aggregations;
          aggregations.should.have.key('DATE_RANGE_CREATION_DATE');
          aggregations['DATE_RANGE_CREATION_DATE'].should.have.key('buckets');
          aggregations['DATE_RANGE_CREATION_DATE'].buckets.should.Array();
          aggregations['DATE_RANGE_CREATION_DATE'].buckets.map(bucket => {
            bucket.should.have.keys('key', 'from', 'from_as_string', 'to', 'to_as_string');
          });
        });
    });

    it('should return multiple aggregations', () => {
      const requestUrl = `/${apiVersion}/records?aggs=terms:source date_range:creationDate:[2018] cardinality:first3AuthorNames.normalized`;
      return request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect('Content-Type', /json/)
        .then(response => {
          const aggregations = JSON.parse(response.text).aggregations;
          aggregations.should.have.key('DATE_RANGE_CREATION_DATE');
          aggregations['DATE_RANGE_CREATION_DATE'].should.have.key('buckets');
          aggregations['DATE_RANGE_CREATION_DATE'].buckets.should.Array();
          aggregations['DATE_RANGE_CREATION_DATE'].buckets.map(bucket => {
            bucket.should.have.keys('key', 'from', 'from_as_string', 'to', 'to_as_string');
          });
          aggregations.should.have.key('TERMS_SOURCE');
          aggregations['TERMS_SOURCE'].should.have.keys('buckets');
          aggregations['TERMS_SOURCE'].buckets.should.Array();
          aggregations['TERMS_SOURCE'].buckets.map(bucket => {
            bucket.should.have.keys('key', 'doc_count');
          });
          aggregations.should.have.key('CARDINALITY_FIRST_3_AUTHOR_NAMES_NORMALIZED');
          aggregations['CARDINALITY_FIRST_3_AUTHOR_NAMES_NORMALIZED'].should.have.keys('value');
        });
    });

    it('should return nested aggregations', () => {
      const requestUrl = `/${apiVersion}/records?aggs=terms:source > (terms:hasDoi cardinality:doi.normalized)`;
      return request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect('Content-Type', /json/)
        .then(response => {
          const aggregations = JSON.parse(response.text).aggregations;
          aggregations.should.have.key('TERMS_SOURCE');
          aggregations['TERMS_SOURCE'].should.have.key('buckets');
          aggregations['TERMS_SOURCE'].buckets.should.Array();
          aggregations['TERMS_SOURCE'].buckets.map(bucket => {
            bucket.should.have.keys('key', 'doc_count');
            bucket.should.have.key('CARDINALITY_DOI_NORMALIZED');
            bucket['CARDINALITY_DOI_NORMALIZED'].should.have.keys('value');
            bucket.should.have.key('TERMS_HAS_DOI');
            bucket['TERMS_HAS_DOI'].should.have.key('buckets');
            bucket['TERMS_HAS_DOI'].buckets.map(bucket => {
              bucket.should.have.keys('key', 'key_as_string', 'doc_count');
            });
          });
        });
    });

    it('should return an 400 Bad request with a syntax error in aggregations', () => {
      const requestUrl = `/${apiVersion}/records?aggs=*$*$*$*$*$*$*$*$*$`;
      return request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
        .expect(400);
    });

  });

  describe('/zip', function() {
    this.timeout(300000);
    it('Should respond with a ZIP including records.json', function(done) {
      const requestUrl = `/${apiVersion}/records/_filter/hal/2014/duplicate/near_duplicate/zip?q="authors:jean"&include=idConditor&limit=617`;
      logInfo('Request on: ' + requestUrl);
      request(app)
        .get(requestUrl)
        .set('X-Forwarded-For', '111.11.11.1') // We spoof our ip
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
            if (print.length >= 10) print = '  RESPONSE STREAM: ';
            ++i;
            console.info('\u001b[1A\u001b[1K\t' + print + i + '  ');
            res.data += chunk;
          });

          res.on('end', function() {
            yauzl.fromBuffer(
               Buffer.from(res.data, 'binary'),
              {lazyEntries: true},
              (err, zipfile) => {
                if (err) return cb(err);

                zipfile.readEntry();

                zipfile.on('entry', (entry) => {
                  entries.push(entry.path);
                  const print = '  UNZIP: ' + entries.length + '/' + _.min([+res.headers['x-result-count'],
                                                                            +res.headers['x-total-count']]) + '  ';
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
          (res.body.length).should.be.equal(_.min([+res.get('X-result-count'), +res.get('X-total-count')]));
          return done(err);
        });
    });
  });
})
;
