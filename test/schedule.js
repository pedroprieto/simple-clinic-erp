var should = require('should');
var Doctor = require('../models/doctor');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');
var testdata = require('./data/testdata');

describe('Schedule resource', function() {
  it("Doctor's schedule CRUD test", async function() {
    var doctor_test = testdata.doctor_test_template_1;
    var hour1 = testdata.doctor_opening_hour_1;
    var hour2 = testdata.doctor_opening_hour_2;

    // Create doctor
    var response = await request(app.server)
        .post(routesList['doctors'].href)
        .set('Accept', 'application/json')
	      .send(doctor_test)
        .expect(201);

    var schedule_url = response.body.collection.items[0].links[0].href;

    // Expect empty list
    var r2 = await request('')
        .get(schedule_url)
        .set('Accept', 'application/json')
        .expect(200);
    var col = r2.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

    // Create opening hour 1
    var r3 = await request('')
        .post(schedule_url)
        .set('Accept', 'application/json')
	      .send(hour1)
        .expect(201);
    col = r3.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.not.equal('message');
    col.items[0].data[0].value.should.equal(hour1.template.data[0].value);
    col.items[0].data[1].value.should.equal(hour1.template.data[1].value);
    col.items[0].data[2].value.should.equal(hour1.template.data[2].value);

    // Create opening hour 2
    r3 = await request('')
        .post(schedule_url)
        .set('Accept', 'application/json')
	      .send(hour2)
        .expect(201);
    col = r3.body.collection;
    col.should.have.property('items').with.lengthOf(2);
    col.items[0].data[0].name.should.not.equal('message');
    col.items[1].data[0].value.should.equal(hour2.template.data[0].value);
    col.items[1].data[1].value.should.equal(hour2.template.data[1].value);
    col.items[1].data[2].value.should.equal(hour2.template.data[2].value);
    var url_created_hour = r3.headers['location'];

    // UPDATE item
    var newday = "Miércoles";
    hour2.template.data[0].value = newday;
    r3 = await request('')
        .put(url_created_hour)
        .set('Accept', 'application/json')
	      .send(hour2)
        .expect(200);
    var c = r3.body.collection;
    c.should.have.property('items').with.lengthOf(2);
    c.items[1].data[0].value.should.equal(newday);

    // Remove item
    r3 = await request('')
        .delete(url_created_hour)
        .set('Accept', 'application/json')
        .expect(200);
    col = r3.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.not.equal('message');
    col.items[0].data[0].value.should.equal(hour1.template.data[0].value);
    col.items[0].data[1].value.should.equal(hour1.template.data[1].value);
    col.items[0].data[2].value.should.equal(hour1.template.data[2].value);
    return r3;

  });
});
