var should = require('should');
var Doctor = require('../models/doctor');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');
var testdata = require('./data/testdata');

describe('Doctors resource', function() {
  it('Doctor CRUD test', async function() {
    var doctor_test = testdata.doctor_test_template_1;

    var response = await request(app.server)
        .post(routesList['doctors'].href)
        .set('Accept', 'application/json')
	      .send(doctor_test)
        .expect(201);

    // GET item from location header and check if it is the same as the original object
    var url_created_doctor = response.headers['location'];
    response = await request('')
        .get(url_created_doctor)
        .set('Accept', 'application/json')
        .expect(200);
    var item = response.body.collection.items[0];
    item.href.should.equal(url_created_doctor);

    // GET doctor list and check item length
    response = await request(app.server)
        .get(routesList['doctors'].href)
        .set('Accept', 'application/json')
        .expect(200);
    response.body.collection.should.have.property('items').with.lengthOf(1);

    // UPDATE item
    var newname = "New name";
    doctor_test.template.data[0].value = newname;
    response = await request('')
        .put(url_created_doctor)
        .set('Accept', 'application/json')
	      .send(doctor_test)
        .expect(200);
    var c = response.body.collection;
    c.should.have.property('items').with.lengthOf(1);
    c.items[0].data[0].value.should.equal(newname);

    // Remove item
    response = await request('')
        .delete(url_created_doctor)
        .set('Accept', 'application/json')
        .expect(200);

    response = await request(app.server)
        .get(routesList['doctors'].href)
        .set('Accept', 'application/json')
        .expect(200);

    var col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');
    return response;

  });
});
