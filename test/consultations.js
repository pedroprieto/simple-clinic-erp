var should = require('should');
var Consultation = require('../models/consultation');
var MedicalProcedure = require('../models/medicalprocedure');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');
var request = require('supertest');
var app = require('../index');
var routesList = require('../routesList');
var testdata = require('./data/testdata');
var Moment = require('moment');

describe('Consultations resource', function() {
  it('Consultation CRUD test', async function() {

    var consultation_test = testdata.consultation_test_template_1;
    var medicalProcedure_test = testdata.medicalProcedure_test_template_1;
    var room_test = testdata.room_test_template_1;
    var patient_test = testdata.patient_test_template_1;
    var doctor_test = testdata.doctor_test_template_1;
    var response;

    // GET consultation list to get template. Check 'related' object to see available doctors, patients and medicalProcedures
    // response = await request(app.server)
    //   .get(routesList['consultations'].href)
    //   .set('Accept', 'application/json')
    //   .expect(200);
    // // Expect empty related doctors array
    // response.body.collection.related.should.have.property('doctors').with.lengthOf(0);
    // // Expect empty related patients array
    // response.body.collection.related.should.have.property('patients').with.lengthOf(0);
    // // Expect empty related medicalProcedures array
    // response.body.collection.related.should.have.property('medicalProcedures').with.lengthOf(0);

    // Create doctor
    response = await request(app.server)
        .post(routesList['doctors'].href)
        .set('Accept', 'application/json')
	      .send(doctor_test)
        .expect(201);

    // Store link to doctor consultations
    var consultations_url = response.body.collection.items[0].links[1].href;

    // Create patient
    response = await request(app.server)
        .post(routesList['patients'].href)
        .set('Accept', 'application/json')
	      .send(patient_test)
        .expect(201);

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

    // Create Medical Procedure
    response = await request(app.server)
      .post(routesList['medicalProcedures'].href)
      .set('Accept', 'application/json')
	    .send(medicalProcedure_test)
      .expect(201);

    // GET consultation list to get template. Check 'related' object to see available doctors, patients and medicalProcedures
    response = await request('')
      .get(consultations_url)
      .set('Accept', 'application/json')
      .expect(200);
    // Check template data length
    response.body.collection.template.should.have.property('data').with.lengthOf(3);
    // Store 'suggest' field for patient
    var patient_suggest = response.body.collection.template.data[1].suggest;
    // Store 'suggest' field for medicalProcedure
    var medicalProcedure_suggest = response.body.collection.template.data[2].suggest;

    // Expect one patient available
    response.body.collection.related.should.have.property(patient_suggest.related).with.lengthOf(1);
    // Expect one medicalProcedures available
    response.body.collection.related.should.have.property(medicalProcedure_suggest.related).with.lengthOf(1);

    // Store patient id
    var patient_id = response.body.collection.related[patient_suggest.related][0][patient_suggest.value];
    var patient_name = response.body.collection.related[patient_suggest.related][0][patient_suggest.text];
    // Store medicalProcedure id
    var medicalProcedure_id = response.body.collection.related[medicalProcedure_suggest.related][0][medicalProcedure_suggest.value];
    var medicalProcedure_name = response.body.collection.related[medicalProcedure_suggest.related][0][medicalProcedure_suggest.text];

    // Associate doctor, patient and medicalProcedure to consultation template
    consultation_test.template.data.push({name: 'patient', value: patient_id});
    consultation_test.template.data.push({name: 'medicalProcedure', value: medicalProcedure_id});

    // Create consultation
    response = await request('')
        .post(consultations_url)
        .set('Accept', 'application/json')
	      .send(consultation_test)
        .expect(201);

    // GET item from location header and check if it is the same as the original object
    var url_created_consultation = response.headers['location'];
    response = await request('')
        .get(url_created_consultation)
        .set('Accept', 'application/json')
        .expect(200);
    var item = response.body.collection.items[0];
    item.href.should.equal(url_created_consultation);

    // Check item 'patient' data
    response.body.collection.items[0].data[1].value.should.equal(patient_id);
    response.body.collection.items[0].data[1].text.should.equal(patient_name);

    // Check item 'medicalProcedure' data
    response.body.collection.items[0].data[2].value.should.equal(medicalProcedure_id);
    response.body.collection.items[0].data[2].text.should.equal(medicalProcedure_name);

    // GET consultation list and check item length
    response = await request('')
      .get(consultations_url)
      .set('Accept', 'application/json')
      .expect(200);
    response.body.collection.should.have.property('items').with.lengthOf(1);

    // UPDATE item
    var newdate = Moment("2018-04-24").format();
    consultation_test.template.data[0].value = newdate;
    response = await request('')
        .put(url_created_consultation)
        .set('Accept', 'application/json')
	      .send(consultation_test)
        .expect(200);
    var c = response.body.collection;
    c.should.have.property('items').with.lengthOf(1);
    var consultation_date = Moment(c.items[0].data[0].value).format();
    consultation_date.should.equal(newdate);

    // Remove item
    response = await request('')
        .delete(url_created_consultation)
        .set('Accept', 'application/json')
        .expect(200);
    var col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

  });
});
