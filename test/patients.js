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

  it('Patient CRUD test', async function() {

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

    // UPDATE item
    var newname = "New name";
    patient_test.template.data[0].value = newname;
    var response4 = await request('')
        .put(url_created_patient)
        .set('Accept', 'application/json')
	      .send(patient_test)
        .expect(200);
    var c = response4.body.collection;
    c.should.have.property('items').with.lengthOf(1);
    c.items[0].data[0].value.should.equal(newname);

    // Remove item
    var response5 = await request('')
        .delete(url_created_patient)
        .set('Accept', 'application/json')
        .expect(200);
    var col = response5.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

  });
});
