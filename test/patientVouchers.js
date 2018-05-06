var should = require('should');
var MedicalProcedure = require('../models/medicalprocedure');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');
var testdata = require('./data/testdata');
var Moment = require('moment');

describe('Patient vouchers resource', function() {
  it('Patient vouchers CRUD test', async function() {

    var medicalProcedure_test = testdata.medicalProcedure_test_template_1;
    var room_test = testdata.room_test_template_1;
    var patient_test = testdata.patient_test_template_1;
    var consultationVoucherType_test = testdata.consultationVoucherType_test_template_1;
    var response;

    // Create patient
    response = await request(app.server)
        .post(routesList['patients'].href)
        .set('Accept', 'application/json')
	      .send(patient_test)
        .expect(201);

    response = await request(app.server)
      .get(routesList['patients'].href)
      .set('Accept', 'application/json')
	    .send(patient_test)
      .expect(200);

    var patientVouchers_url = response.body.collection.items[0].links[0].href;

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




    // GET patient Voucher list to get template. Check 'related' object to see consultationVoucherTypes
    response = await request('')
      .get(patientVouchers_url)
      .set('Accept', 'application/json')
      .expect(200);
    // Check template data length
    response.body.collection.template.should.have.property('data').with.lengthOf(1);
    // Store 'suggest' field for consultationVoucherType
    var consultationVoucherType_suggest = response.body.collection.template.data[0].suggest;

    // Expect one consultationVoucherType available
    response.body.collection.related.should.have.property(consultationVoucherType_suggest.related).with.lengthOf(1);

    // Store consultationVoucherType id and name
    var consultationVoucherType_id = response.body.collection.related[consultationVoucherType_suggest.related][0][consultationVoucherType_suggest.value];
    var consultationVoucherType_name = response.body.collection.related[consultationVoucherType_suggest.related][0][consultationVoucherType_suggest.text];

    // Create template for patientVoucher
    var patientVoucher_test = {template: response.body.collection.template};
    // Associate patientVoucher id to template
    patientVoucher_test.template.data[0].value = response.body.collection.related[consultationVoucherType_suggest.related][0][consultationVoucherType_suggest.value];

    // Create patientVoucher
    response = await request('')
      .post(patientVouchers_url)
      .set('Accept', 'application/json')
	    .send(patientVoucher_test)
      .expect(201);

    // GET item from location header and check if it is the same as the original object
    var url_created_patientVoucher = response.headers['location'];
    response = await request('')
        .get(url_created_patientVoucher)
        .set('Accept', 'application/json')
        .expect(200);
    var item = response.body.collection.items[0];
    item.href.should.equal(url_created_patientVoucher);

    // Check item 'patient' data
    // response.body.collection.items[0].data[0].value.should.equal(patient_id);
    // response.body.collection.items[0].data[0].text.should.equal(patient_name);

    // Check item 'consultationVoucherType' data
    response.body.collection.items[0].should.have.property('data').with.lengthOf(5);
    var cVT = response.body.collection.items[0].data.filter(function(el) {return el.name=='consultationVoucherType';})[0];
    // cVT.value.should.equal(consultationVoucherType_name);

    // GET consultation list and check item length
    response = await request('')
      .get(patientVouchers_url)
      .set('Accept', 'application/json')
      .expect(200);
    response.body.collection.should.have.property('items').with.lengthOf(1);

    // UPDATE item
    // var newdate = Moment("2018-04-24").format();
    // consultation_test.template.data[0].value = newdate;
    // response = await request('')
    //     .put(url_created_consultation)
    //     .set('Accept', 'application/json')
	  //     .send(consultation_test)
    //     .expect(200);
    // var c = response.body.collection;
    // c.should.have.property('items').with.lengthOf(1);
    // var consultation_date = Moment(c.items[0].data[0].value).format();
    // consultation_date.should.equal(newdate);

    // Remove item
    response = await request('')
        .delete(url_created_patientVoucher)
        .set('Accept', 'application/json')
        .expect(200);


    response = await request('')
      .get(patientVouchers_url)
      .set('Accept', 'application/json')
      .expect(200);

    var col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

  });
});
