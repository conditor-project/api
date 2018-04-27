'use strict';

const request    = require('supertest'),
      app        = require('../../src/worker'),
      {generate} = require('../../src/jwtToken')

;


describe('GET /records', function() {
  after(function() {
    app._close();
  });
  describe('With valid JWT Authorization Request Header Field', function() {
    it('Should return status 200', function(done) {
      const token = generate();
      request(app)
        .get('/v1/records')
        .set('X-Forwarded-For','166.66.6.6') // We spoof our ip
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end(done);
    });
  });

  describe('With invalid JWT Authorization Request Header Field', function() {
    it('Should return status 401', function(done) {
      const token = generate();
      request(app)
        .get('/v1/records')
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
        .get('/v1/records')
        .set('X-Forwarded-For','166.66.6.6') // We spoof our ip
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .end(done);
    });
  });

  describe('With valid JWT URI query parameter', function() {
    it('Should return status 200', function(done) {
      const token = generate();
      request(app)
        .get(`/v1/records?access_token=${token}`)
        .set('X-Forwarded-For','166.66.6.6') // We spoof our ip
        .expect(200)
        .end(done);

    });
  });

  describe('With JWT URI query parameter and JWT Authorization Request Header Field', function() {
    it('Should return status 400', function(done) {
      const token = generate();
      request(app)
        .get(`/v1/records?access_token=${token}`)
        .set('Authorization', `Bearer ${token}invalid`)
        .expect(400)
        .end(done);

    });
  });

  describe('With valid IP', function() {
    it('Should return status 200', function(done) {
      request(app)
        .get('/v1/records')
        //.set('X-Forwarded-For','111.11.11.1') // We spoof our ip
        .expect(200)
        .end(done);
    });
  });
});
