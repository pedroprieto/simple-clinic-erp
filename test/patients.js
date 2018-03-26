var should = require('should');
var Patient = require('../models/patient');
var request = require('supertest');
var app = require('../index.js');

describe('GET /patients', function() {
  // Close server after tests
  after((done) => {
    app.close();
    done();
  });

  it('responds with json', async function() {
    var response = await request(app)
        .get('/patients')
        .set('Accept', 'application/json')
        .expect(200);
		response.body.collection.items.length.should.be.equal(1);
  });
});
