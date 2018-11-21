'use strict';

const request    = require('supertest'),
      app        = require('../../src/worker'),
      {generate} = require('../../src/jwtToken'),
      semver    = require('semver'),
      config    = require('config-component').get(module)
;

const apiVersion = `v${semver.major(config.app.version)}`;

describe('GET /records', function() {
  after(function() {
    app._close();
  });
  describe('With valid JWT Authorization Request Header Field', function() {
    it('Should return status 2xx', function(done) {
      const token = generate();
      request(app)
        .get(`/${apiVersion}/records`)
        .set('X-Forwarded-For','166.66.6.6') // We spoof our ip
        .set('Authorization', `Bearer ${token}`)
        .end(done);
    });
  });

  describe('With invalid JWT Authorization Request Header Field', function() {
    it('Should return status 401', function(done) {
      const token = generate();
      request(app)
        .get(`/${apiVersion}/records`)
        .set('X-Forwarded-For','166.66.6.6') // We spoof our ip
        .set('Authorization', `Bearer ${token}invalid`)
        .expect(401)
        .end(done);
    });
  });

  describe('With valid JWT Authorization Request Header Field and forbiden id', function() {
    it('Should return status 401', function(done) {
      const token = generate({jwtId:'forbidThisId'});
      request(app)
        .get(`/${apiVersion}/records`)
        .set('X-Forwarded-For','166.66.6.6') // We spoof our ip
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .end(done);
    });
  });

  describe('With valid JWT URI query parameter', function() {
    it('Should return status 2xx', function(done) {
      const token = generate();
      request(app)
        .get(`/${apiVersion}/records?access_token=${token}`)
        .set('X-Forwarded-For','166.66.6.6') // We spoof our ip
        .end(done);

    });
  });

  describe('With JWT URI query parameter and JWT Authorization Request Header Field', function() {
    it('Should return status 400', function(done) {
      const token = generate();
      request(app)
        .get(`/${apiVersion}/records?access_token=${token}`)
        .set('Authorization', `Bearer ${token}invalid`)
        .expect(400)
        .end(done);

    });
  });

  describe('With valid IP', function() {
    it('Should return status 2xx', function(done) {
      request(app)
        .get(`/${apiVersion}/records`)
        .set('X-Forwarded-For','111.11.11.1') // We spoof our ip
        .end(done);
    });
  });
});
