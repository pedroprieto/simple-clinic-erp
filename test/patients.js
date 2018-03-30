var should = require('should');
var Patient = require('../models/patient');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');

describe('Patients resource', function() {
  // Close server after tests
  after((done) => {
    app.server.close();
    done();
  });

  it('Create patient', async function() {

    var patient_test = {
	    template: {
	      data: [
		      {name: "givenName", value: "Patient name 1"},
		      {name: "familyName", value: "Family Name patient 1"},
		      {name: "taxID", value: "123456789k"},
		      {name: "birthDate", value: "2018-01-24"},
		      {name: "telephone", value: "666666666"},
		      {name: "address", value: "Test address st"},
		      {name: "email", value: "patient1@email.com"},
		      {name: "diagnosis", value: "Main diagnosis description."},
		      {name: "description", value: "Patient 1 additional notes"}
	      ]
	    }
    };
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
