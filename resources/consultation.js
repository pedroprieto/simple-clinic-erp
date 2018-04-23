// Consultations resource
var Consultation = require('../models/consultation');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');
var MedicalProcedure = require('../models/medicalprocedure');
var Moment = require('moment');
var PatientVoucher = require('../models/patientVoucher');
var Invoice = require('../models/invoice');
var CJUtils = require('../aux/CJUtils');

module.exports = function(router) {

  function renderCollectionConsultations(ctx, consultationList) {
    var col = {};
    col.version = "1.0";

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

	  // Items
	  col.items = consultationList.map(function(p) {
      var item = {};

	    // Item data
      item.data = Consultation.objToCJ(p.consultationToCJ());

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["consultation"], {consultation: p._id}).href;

	    // Item links
      item.links = [];
      if (!p.invoiced && !p._assignedVoucher) {
        item.links.push(ctx.getLinkCJFormat(router.routesList["consultationAssignInvoice"], {consultation: p._id}));
        item.links.push(ctx.getLinkCJFormat(router.routesList["consultationAssignVoucher"], {consultation: p._id}));
      }

	    return item;
	  });

	  // If no items
	  if (consultationList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay consultas");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Return collection object
    return col;

  }

  // Parameter consultation
  router.param('consultation', async (id, ctx, next) => {
    ctx.consultation = await Consultation.findOne({_id: id}).populate(['doctor', 'patient', 'medicalProcedure']).exec();
    return next();
  });

  // Parameter date
  router.param('date', (id, ctx, next) => {
    ctx.date = id;
    return next();
  });

  // GET Doctor consultation list
  router.get(router.routesList["consultations"].name, router.routesList["consultations"].href, async (ctx, next) => {

    // Get selected ISO week in query. Current week if invalid or no query
    var queryweek = ctx.query.isoweekdate;

    var cur_date = Moment();
    var displayed_date = Moment(queryweek);

    if (!displayed_date.isValid()) {
      return ctx.redirect(router.routesList["consultations"].href);
    }

    var cur_isoweekdate = cur_date.format('GGGG[-W]WW');
    var isoweekdate = displayed_date.clone().format('GGGG[-W]WW');
    var nextisoweekdate = displayed_date.clone().add(1,'w').format('GGGG[-W]WW');
    var previousisoweekdate= displayed_date.clone().subtract(1,'w').format('GGGG[-W]WW');

    // Get consultations from specified week
    var consultations = await Consultation.findInDateRange(displayed_date.clone().startOf('isoWeek').toDate(), displayed_date.clone().endOf('isoWeek').toDate(), ctx.doctor._id);
    var col= await renderCollectionConsultations(ctx, consultations);

    // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: ctx.doctor._id}).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: ctx.doctor._id}).prompt;

    // Doctor link
    var doctor_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
    doctor_link.prompt = ctx.doctor.fullName;
    col.links.push(doctor_link);

    // Pagination links
    var l;
    l = ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: cur_isoweekdate}});
    l.rel = 'current';
    l.prompt = 'Semana actual';
    col.links.push(l);

    l = ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: previousisoweekdate}});
    l.rel = 'prev';
    l.prompt = 'Semana anterior';
    col.links.push(l);

    l = ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: nextisoweekdate}});
    l.rel = 'next';
    l.prompt = 'Semana siguiente';
    col.links.push(l);

	  // Template
    col.template = {data: []};
    col.template.data.push(
      {
        prompt: "Seleccionar fecha",
        name: "date",
        value: "",
        type: 'date',
        required: true
      }
    );

    ctx.body = {collection: col};
    return next();

  });

  // Get patient consultation list
  router.get(router.routesList["patientConsultations"].name, router.routesList["patientConsultations"].href, async (ctx, next) => {

    var consultations = await Consultation.findByPatient(ctx.patient._id);
    var col= await renderCollectionConsultations(ctx, consultations);

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["patientConsultations"], {patient: ctx.patient._id}).href;

	  // Collection title
    col.href= ctx.getLinkCJFormat(router.routesList["patientConsultations"], {patient: ctx.patient._id}).prompt;

	  // Patient Link
    var patient_link = ctx.getLinkCJFormat(router.routesList["patient"], {patient: ctx.patient._id});
    patient_link.prompt = ctx.patient.fullName;
    col.links.push(patient_link);

    ctx.body = {collection: col};
    return next();

  });


  // GET item
  router.get(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
	  var consultations = [];
	  consultations.push(ctx.consultation);
    var col = await renderCollectionConsultations(ctx, consultations);
    // TODO: improve
    col.items[0].links.push(ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.consultation.doctor._id}));
    col.items[0].links.push(ctx.getLinkCJFormat(router.routesList["patient"], {patient: ctx.consultation.patient._id}));
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
    var doc = await Consultation.delById(ctx.consultation._id);
    ctx.status = 200;
    return next();

  });


  // PUT item
  router.put(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
    var consultationData = CJUtils.parseTemplate(ctx);
    var aa = await Consultation.updateById(ctx.consultation._id, consultationData);
    ctx.status = 200;
    return next();
  });


  // Consultations select patient
  router.get(router.routesList["consultations_select_patient"].name, router.routesList["consultations_select_patient"].href, async (ctx,next) => {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["patients"]).href;

	  // Collection title
    col.title = "Seleccionar paciente para la consulta";

	  // Collection Links
    col.links = [];

	  // Items
    var patientList = await Patient.find();
	  col.items = patientList.map(function(p) {

      var item = {};
	    // Item data
	    item.data = p.toObject({transform: Patient.tx_cj});

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["patient"], {patient: p._id}).href;

	    // Item link
      // Link to select med Proc
      item.links = [];
      item.links.push(ctx.getLinkCJFormat(router.routesList["consultations_select_medProc"], {doctor: ctx.doctor._id, date: ctx.date, patient: p._id}));

	    return item;
	  });

	  // If no items
	  if (patientList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay pacientes");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = Patient.template();
    col.template.data.push(
      {
		    name : 'nextStep',
		    value: ctx.getLinkCJFormat(router.routesList["consultations_select_patient"], {doctor: ctx.doctor._id, date: ctx.date}).href,
        prompt : 'next step',
        type: 'hidden'
      });

	  // Return collection object
    ctx.body = {collection: col};
    return next();

  });

  router.get(router.routesList["consultations_select_medProc"].name, router.routesList["consultations_select_medProc"].href, async (ctx,next) => {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["medicalProcedures"]).href;

	  // Collection title
    col.title = "Seleccionar tipo de consulta";

	  // Collection Links
    col.links = [];

	  // Items
    var medProcList = await MedicalProcedure.find();
	  col.items = medProcList.map(function(p) {

      var item = {};
	    // Item data
	    item.data = p.toObject({transform: MedicalProcedure.tx_cj});

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["medicalProcedure"], {medicalprocedure: p._id}).href;

	    // Item link
      // Link to create consultation form
      item.links = [];
      item.links.push(ctx.getLinkCJFormat(router.routesList["consultations_create"], {doctor: ctx.doctor._id, date: ctx.date, patient: ctx.patient._id, medicalprocedure: p._id}));

	    return item;
	  });

	  // If no items
	  if (medProcList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay tipos de consulta creadas");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = MedicalProcedure.template();
    col.template.data.push(
      {
		    name : 'nextStep',
		    value: ctx.getLinkCJFormat(router.routesList["consultations_select_medProc"], {doctor: ctx.doctor._id, date: ctx.date, patient: ctx.patient._id}).href,
        prompt : 'next step',
        type: 'hidden'
      });

	  // Return collection object
    ctx.body = {collection: col};
    return next();


  });

  // Template to create consultation
  router.get(router.routesList["consultations_create"].name, router.routesList["consultations_create"].href, async (ctx,next) => {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href = ctx.getLinkCJFormat(router.routesList["consultations_create"], {doctor: ctx.doctor._id, date: ctx.date, patient: ctx.patient._id, medicalprocedure: ctx.medicalProcedure._id}).href;

	  // Template
    col.template = {data: []};
    col.template.data.push(
      {
        prompt: "Crear consulta",
        name: "confirm",
        value: true,
        type: 'checkbox',
        required: true
      }
    );

	  // Return collection object
    ctx.body = {collection: col};
    return next();

  });


  // POST: create consultation
  router.post(router.routesList["consultations_create"].href, async (ctx,next) => {

    var data = {};
    data.date = ctx.date;
    data.doctor = ctx.doctor._id;
    data.patient = ctx.patient._id;
    data.medicalProcedure = ctx.medicalProcedure._id;
    var p = new Consultation(data);
    var psaved = await p.save();
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {consultation: psaved._id}).href);
    return next();

  });

  // POST select date
  router.post(router.routesList["consultations"].href, async (ctx,next) => {
    var data = await CJUtils.parseTemplate(ctx);

    if (! Moment(data.date).isValid())
      ctx.throw(400, 'La fecha no es válida.');

    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultations_select_patient"], {doctor: ctx.doctor._id, date: data.date}).href);
    return next();
  });


}
