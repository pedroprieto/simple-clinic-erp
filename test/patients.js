var should = require('should');
var Patient = require('../models/patient');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');
var testdata = require('./data/testdata');

describe('Patients resource', function() {
  // Close server after tests
  after((done) => {
    app.server.close();
    done();
  });

  it('Create patient', async function() {

    var patient_test = testdata.patient_test_template_1;

    var response = await request(app.server)
        .post(routesList['patients'].href)
        .set('Accept', 'application/json')
	      .send(patient_test)
        .expect(201);

    // GET item from location header and check if it is the same as the original object
    var url_created_patient = response.headers['location'];
    var response2 = await request('')
        .get(url_created_patient)
        .set('Accept', 'application/json')
        .expect(200);
    var item = response2.body.collection.items[0];
    item.href.should.equal(url_created_patient);

    // GET patient list and check item length
    var response3 = await request(app.server)
        .get(routesList['patients'].href)
        .set('Accept', 'application/json')
        .expect(200);
    response3.body.collection.should.have.property('items').with.lengthOf(1);

  });
});