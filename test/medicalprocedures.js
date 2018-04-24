var should = require('should');
var MedicalProcedure = require('../models/medicalprocedure');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');
var testdata = require('./data/testdata');

describe('MedicalProcedures resource', function() {
  it('MedicalProcedure CRUD test', async function() {
    var medicalProcedure_test = testdata.medicalProcedure_test_template_1;
    var room_test = testdata.room_test_template_1;

    // GET medicalProcedure list to get template. Check 'related' object to see available rooms
    response = await request(app.server)
      .get(routesList['medicalProcedures'].href)
      .set('Accept', 'application/json')
      .expect(200);
    // Expect empty related roomlist array
    response.body.collection.related.should.have.property('roomlist').with.lengthOf(0);

    // Create room
    var response = await request(app.server)
        .post(routesList['rooms'].href)
        .set('Accept', 'application/json')
	      .send(room_test)
        .expect(201);

    // GET medicalProcedure list to get template. Check 'related' object to see available rooms
    response = await request(app.server)
      .get(routesList['medicalProcedures'].href)
      .set('Accept', 'application/json')
      .expect(200);
    // Check template data length
    response.body.collection.template.should.have.property('data').with.lengthOf(4);
    // Expect one room available
    response.body.collection.related.should.have.property('roomlist').with.lengthOf(1);
    // Store room id and name
    var room_id = response.body.collection.related.roomlist[0]._id;
    var room_name = response.body.collection.related.roomlist[0].name;

    // Associate room to medical procedure template
    medicalProcedure_test.template.data.push({name: 'room', value: room_id});

    // Create Medical Procedure
    response = await request(app.server)
        .post(routesList['medicalProcedures'].href)
        .set('Accept', 'application/json')
	      .send(medicalProcedure_test)
        .expect(201);

    // GET item from location header and check if it is the same as the original object
    var url_created_medicalProcedure = response.headers['location'];
    response = await request('')
        .get(url_created_medicalProcedure)
        .set('Accept', 'application/json')
        .expect(200);
    var item = response.body.collection.items[0];
    item.href.should.equal(url_created_medicalProcedure);

    // Check item 'room' data
    response.body.collection.items[0].data[3].value.should.equal(room_name);

    // GET medicalProcedure list and check item length
    response = await request(app.server)
        .get(routesList['medicalProcedures'].href)
        .set('Accept', 'application/json')
        .expect(200);
    response.body.collection.should.have.property('items').with.lengthOf(1);

    // UPDATE item
    var newname = "New name";
    var newduration = '01:00';
    medicalProcedure_test.template.data[0].value = newname;
    medicalProcedure_test.template.data[1].value = newduration;
    response = await request('')
        .put(url_created_medicalProcedure)
        .set('Accept', 'application/json')
	      .send(medicalProcedure_test)
        .expect(200);
    var c = response.body.collection;
    c.should.have.property('items').with.lengthOf(1);
    c.items[0].data[0].value.should.equal(newname);
    c.items[0].data[1].value.should.equal(newduration);

    // Remove item
    response = await request('')
        .delete(url_created_medicalProcedure)
        .set('Accept', 'application/json')
        .expect(200);

    response = await request(app.server)
      .get(routesList['medicalProcedures'].href)
      .set('Accept', 'application/json')
      .expect(200);

    var col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

  });
});
