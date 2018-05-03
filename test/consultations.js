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

    // Get Doctor list
    response = await request(app.server)
      .get(routesList['doctors'].href)
      .set('Accept', 'application/json')
      .expect(200);

    // Store link to doctor consultations
    var consultations_url = response.body.collection.items[0].links.filter(function(el) {return el.prompt == 'Consultas'})[0].href;

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

    // GET consultation list to get template.
    response = await request('')
      .get(consultations_url)
      .set('Accept', 'application/json')
      .expect(200);
    // Check template data length
    response.body.collection.template.should.have.property('data').with.lengthOf(1);
    response.body.collection.template.data[0].name.should.equal('date');

    // Select consultation date
    response = await request('')
        .post(consultations_url)
        .set('Accept', 'application/json')
	      .send(consultation_test)
        .expect(201);

    // GET item from location header. This is next step
    var url_consultation_select_patient = response.headers['location'];
    response = await request('')
        .get(url_consultation_select_patient)
        .set('Accept', 'application/json')
        .expect(200);
    // Get one patient available
    var pat = response.body.collection.items[0];
    pat.should.have.property('links').with.lengthOf(1);

    // Get item link. This is next step
    var url_consultation_select_medProc = pat.links[0].href;
    response = await request('')
      .get(url_consultation_select_medProc)
      .set('Accept', 'application/json')
      .expect(200);
    // Get one medical procedure available
    var medProc = response.body.collection.items[0];
    medProc.should.have.property('links').with.lengthOf(1);

    // Get item link. This is next step
    var url_consultation_create = medProc.links[0].href;
    response = await request('')
      .get(url_consultation_create)
      .set('Accept', 'application/json')
      .expect(200);

    // Check template data length
    var consultation_create_template = response.body.collection.template;
    consultation_create_template.should.have.property('data').with.lengthOf(1);
    consultation_create_template.data[0].name.should.equal('confirm');

    // Create consultation
    response = await request('')
      .post(url_consultation_create)
      .set('Accept', 'application/json')
	    .send({template: consultation_create_template})
      .expect(201);
    var url_created_consultation = response.headers['location'];

    // GET consultation list and check item length
    var con_list_url = consultations_url + '?isoweekdate=' + Moment(consultation_test.template.data[0].value).format('GGGG[-W]WW');
    response = await request('')
      .get(con_list_url)
      .set('Accept', 'application/json')
      .expect(200);
    response.body.collection.should.have.property('items').with.lengthOf(1);
    response.body.collection.items[0].data[0].name.should.not.equal('message');

    // UPDATE item
    var newdatemoment = Moment("2018-04-24");
    var newdate = newdatemoment.format();
    consultation_test.template.data[0].value = newdate;
    response = await request('')
        .put(url_created_consultation)
        .set('Accept', 'application/json')
	      .send(consultation_test)
        .expect(200);


    response = await request('')
      .get(consultations_url + '?isoweekdate=' + newdatemoment.format('GGGG[-W]WW'))
      .set('Accept', 'application/json')
      .expect(200)

    var c = response.body.collection;
    c.should.have.property('items').with.lengthOf(1);
    var consultation_date = Moment(c.items[0].data.filter(function(el) {return el.name == 'date'})[0].value).format();
    // consultation_date.should.equal(newdate);

    // Remove item
    response = await request('')
        .delete(url_created_consultation)
        .set('Accept', 'application/json')
        .expect(200);

    response = await request('')
      .get(consultations_url, {params: {isoweekdate: newdatemoment.format('GGGG[-W]WW')}})
      .set('Accept', 'application/json')
      .expect(200)

    var col = response.body.collection;
    col.should.have.property('items').with.lengthOf(1);
    col.items[0].data[0].name.should.equal('message');

  });
});
