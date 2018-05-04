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

    // Get Doctor list
    response = await request(app.server)
      .get(routesList['doctors'].href)
      .set('Accept', 'application/json')
      .expect(200);

    var schedule_url = response.body.collection.items[0].links[0].href;

    // Expect empty list
    response = await request('')
        .get(schedule_url)
        .set('Accept', 'application/json')
        .expect(200);
    var col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

    // Create opening hour 1
    response = await request('')
        .post(schedule_url)
        .set('Accept', 'application/json')
	      .send(hour1)
        .expect(201);

    var url_created_openingHour = response.headers['location'];

    response = await request('')
      .get(schedule_url)
      .set('Accept', 'application/json')
      .expect(200);

    col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data.filter(function(el) {return el.name == 'dayOfWeek'})[0].value.should.equal(hour1.template.data[0].value);
    col.items[0].data.filter(function(el) {return el.name == 'opens'})[0].value.should.equal(hour1.template.data[1].value);
    col.items[0].data.filter(function(el) {return el.name == 'closes'})[0].value.should.equal(hour1.template.data[2].value);

    // Create opening hour 2
    response = await request('')
        .post(schedule_url)
        .set('Accept', 'application/json')
	      .send(hour2)
        .expect(201);

    url_created_openingHour = response.headers['location'];
    response = await request('')
      .get(schedule_url)
      .set('Accept', 'application/json')
      .expect(200);

    col = response.body.collection;
    col.should.have.property('items').with.lengthOf(2);
    col.items[1].data.filter(function(el) {return el.name == 'dayOfWeek'})[0].value.should.equal(hour2.template.data[0].value);
    col.items[1].data.filter(function(el) {return el.name == 'opens'})[0].value.should.equal(hour2.template.data[1].value);
    col.items[1].data.filter(function(el) {return el.name == 'closes'})[0].value.should.equal(hour2.template.data[2].value);


    // UPDATE item
    var newday = 3;
    hour2.template.data[0].value = newday;
    response = await request('')
        .put(url_created_openingHour)
        .set('Accept', 'application/json')
	      .send(hour2)
        .expect(200);

    response = await request('')
      .get(schedule_url)
      .set('Accept', 'application/json')
      .expect(200);

    col = response.body.collection;
    col.should.have.property('items').with.lengthOf(2);
    col.items[1].data.filter(function(el) {return el.name == 'dayOfWeek'})[0].value.should.equal(newday);

    // Remove item
    response = await request('')
        .delete(url_created_openingHour)
        .set('Accept', 'application/json')
        .expect(200);

    response = await request('')
      .get(schedule_url)
      .set('Accept', 'application/json')
      .expect(200);

    col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.not.equal('message');
    col.items[0].data.filter(function(el) {return el.name == 'dayOfWeek'})[0].value.should.equal(hour1.template.data[0].value);
    col.items[0].data.filter(function(el) {return el.name == 'opens'})[0].value.should.equal(hour1.template.data[1].value);
    col.items[0].data.filter(function(el) {return el.name == 'closes'})[0].value.should.equal(hour1.template.data[2].value);
    return response;

  });
});
