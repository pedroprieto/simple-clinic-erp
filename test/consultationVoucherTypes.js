var should = require('should');
var ConsultationVoucherType = require('../models/consultationVoucherType');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');
var testdata = require('./data/testdata');

describe('ConsultationVoucherTypes resource', function() {
  it('ConsultationVoucherType CRUD test', async function() {
    var consultationVoucherType_test = testdata.consultationVoucherType_test_template_1;
    var medicalProcedure_test = testdata.medicalProcedure_test_template_1;
    var room_test = testdata.room_test_template_1;

    // GET consultationVoucherType list to get template. Check 'related' object to see available medicalProcedures
    var response = await request(app.server)
      .get(routesList['consultationVoucherTypes'].href)
      .set('Accept', 'application/json')
      .expect(200);
    // Expect empty related medicalProcedureList array
    response.body.collection.related.should.have.property('medicalProcedurelist').with.lengthOf(0);

    // Create room
    response = await request(app.server)
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


    // Create medicalProcedure
    response = await request(app.server)
        .post(routesList['medicalProcedures'].href)
        .set('Accept', 'application/json')
	      .send(medicalProcedure_test)
        .expect(201);

    // GET consultationVoucherType list to get template. Check 'related' object to see available medicalProcedures
    response = await request(app.server)
      .get(routesList['consultationVoucherTypes'].href)
      .set('Accept', 'application/json')
      .expect(200);
    // Check template data length
    response.body.collection.template.should.have.property('data').with.lengthOf(4);
    // Expect one medicalProcedure available
    response.body.collection.related.should.have.property('medicalProcedurelist').with.lengthOf(1);
    // Store medicalProcedure id and name
    var medicalProcedure_id = response.body.collection.related.medicalProcedurelist[0]._id;
    var medicalProcedure_name = response.body.collection.related.medicalProcedurelist[0].name;

    // Associate medicalProcedure to Consultation Voucher Type template
    consultationVoucherType_test.template.data.push({name: 'medicalProcedure', value: medicalProcedure_id});

    // Create Consultation Voucher Type
    response = await request(app.server)
        .post(routesList['consultationVoucherTypes'].href)
        .set('Accept', 'application/json')
	      .send(consultationVoucherType_test)
        .expect(201);

    // GET item from location header and check if it is the same as the original object
    var url_created_consultationVoucherType = response.headers['location'];
    response = await request('')
        .get(url_created_consultationVoucherType)
        .set('Accept', 'application/json')
        .expect(200);
    var item = response.body.collection.items[0];
    item.href.should.equal(url_created_consultationVoucherType);


    // Check item 'medicalProcedure' data
    response.body.collection.items[0].data[3].value.should.equal(medicalProcedure_id);
    response.body.collection.items[0].data[3].text.should.equal(medicalProcedure_name);

    // GET consultationVoucherType list and check item length
    response = await request(app.server)
        .get(routesList['consultationVoucherTypes'].href)
        .set('Accept', 'application/json')
        .expect(200);
    response.body.collection.should.have.property('items').with.lengthOf(1);

    // UPDATE item
    var newname = "New name";
    var newprice = 60;
    consultationVoucherType_test.template.data[0].value = newname;
    consultationVoucherType_test.template.data[2].value = newprice;
    response = await request('')
        .put(url_created_consultationVoucherType)
        .set('Accept', 'application/json')
	      .send(consultationVoucherType_test)
        .expect(200);
    var c = response.body.collection;
    c.should.have.property('items').with.lengthOf(1);
    c.items[0].data[0].value.should.equal(newname);
    c.items[0].data[2].value.should.equal(newprice);

    // Remove item
    response = await request('')
        .delete(url_created_consultationVoucherType)
        .set('Accept', 'application/json')
        .expect(200);
    var col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

  });
});
