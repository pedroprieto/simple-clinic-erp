// Consultations resource
var Consultation = require('../models/consultation');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');
var MedicalProcedure = require('../models/medicalprocedure');
var Moment = require('moment');
var PatientVoucher = require('../models/patientVoucher');
var Invoice = require('../models/invoice');

module.exports = function(router) {

  function renderCollectionConsultations(ctx, consultationList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: ctx.doctor._id}).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: ctx.doctor._id}).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));

	  // Items
	  col.items = consultationList.map(function(p) {
      var item = {};

	    // Item data
      item.data = Consultation.objToCJ(p);

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["consultation"], {doctor: ctx.doctor._id, consultation: p._id}).href;

	    // Item links
      item.links = [];
      if (!p.invoiced && !p._assignedVoucher) {
        item.links.push(ctx.getLinkCJFormat(router.routesList["consultationAssignInvoice"], {doctor: ctx.doctor._id, consultation: p._id}));
        item.links.push(ctx.getLinkCJFormat(router.routesList["consultationAssignVoucher"], {doctor: ctx.doctor._id, consultation: p._id}));
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

	  // Queries

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

	  // Return collection object
    return col;

  }

  // Parameter consultation
  router.param('consultation', async (id, ctx, next) => {
    ctx.consultation = await Consultation.findById(id);
    return next();
  });

  // Parameter date
  router.param('date', (id, ctx, next) => {
    ctx.date = id;
    return next();
  });

  // GET Consultation list
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

    col.links.push(ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: cur_isoweekdate}} ));
    col.links.push(ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: nextisoweekdate}} ));
    col.links.push(ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: previousisoweekdate}} ));

    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
	  var consultations = [];
	  consultations.push(ctx.consultation);
    var col = await renderCollectionConsultations(ctx, consultations);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
    var doc = await Consultation.delById (ctx.consultation._id);
    ctx.status = 200;
    return next();

  });

  // Aux function for PUT and POST
  function parseTemplate(ctx) {
	  if ((typeof ctx.request.body.template === 'undefined') || (typeof ctx.request.body.template.data === 'undefined') || (!Array.isArray(ctx.request.body.template.data))) {
      ctx.throw(400, 'Los datos no están en formato CJ');
	  }

    var data = ctx.request.body.template.data;

    // Convert CJ format to JS object
	  var consultationData = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	  } , {});

    return consultationData;
  }

  // PUT item
  router.put(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
    var consultationData = parseTemplate(ctx);
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
    // TODO: link to create patient template

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
    // TODO: link to create medProc template

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
        type: 'text',
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
    // console.log(router.routesList["consultation"], {doctor: ctx.doctor._id, consultation: psaved._id}).href;

    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {doctor: ctx.doctor._id, consultation: psaved._id}).href);
    return next();

  });

  // POST
  router.post(router.routesList["consultations"].href, async (ctx,next) => {
	  if ((typeof ctx.request.body.template === 'undefined') || (typeof ctx.request.body.template.data === 'undefined') || (!Array.isArray(ctx.request.body.template.data))) {
      ctx.throw(400, 'Los datos no están en formato CJ');
	  }

    var data = ctx.request.body.template.data;

    // TODO: check valid date

    // Convert CJ format to JS object
	  var consultationData = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	  } , {});

    
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultations_select_patient"], {doctor: ctx.doctor._id, date: consultationData.date}).href);
    return next();
    // var consultationData = await parseTemplate(ctx);
    // var associated_doctor = await Doctor.findById(ctx.doctor._id);
    // var associated_patient = await Patient.findById(consultationData.patient);
    // var associated_medicalProcedure= await MedicalProcedure.findById(consultationData.medicalProcedure);
    // //TODO
    // if (typeof associated_doctor === 'undefined') {
    //   ctx.throw('400', 'Error');
    // } else {
    //   consultationData.doctor = associated_doctor._id;
    //   consultationData.patient = associated_patient._id;
    //   consultationData.medicalProcedure = associated_medicalProcedure._id;
    //   var p = new Consultation(consultationData);
    //   var psaved = await p.save();
    //   var consultations = await Consultation.find().populate(['patient', 'doctor', 'medicalProcedure']).exec();
    //   var col= await renderCollectionConsultations(ctx, consultations);
    //   ctx.body = {collection: col};
    //   ctx.status = 201;
    //   ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {doctor: ctx.doctor._id, consultation: psaved._id}).href);
    //   return next();
    // }
  });


  // Consultation assign Invoice
  router.get(router.routesList["consultationAssignInvoice"].name, router.routesList["consultationAssignInvoice"].href, async (ctx, next) => {

    if (ctx.consultation._associatedVoucher) {
      ctx.throw(400, 'La consulta tiene un bono asociado. No se puede crear la factura.');
    }

    if (ctx.consultation.invoiced) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede crear la factura.');
    }

    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultationAssignInvoice"], {consultation: ctx.consultation._id, doctor: ctx.doctor._id}).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["consultationAssignInvoice"], {consultation: ctx.consultation._id, doctor: ctx.doctor._id}).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));

    // Collection template
    col.template = {data: []};
    col.template.data.push({prompt: 'Fecha de factura', name: 'invoiceDate', value: Moment().format('YYYY-MM-DD'), type: 'date'});

    ctx.body = {collection: col};
    return next();

  });

  // Post assigned Invoice
  router.post(router.routesList["consultationAssignInvoice"].href, async (ctx, next) => {

    if (ctx.consultation._associatedVoucher) {
      ctx.throw(400, 'La consulta tiene un bono asociado. No se puede crear la factura.');
    }

    if (ctx.consultation.invoiced) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede crear la factura.');
    }

    var data = await parseTemplate(ctx);
    ctx.consultation.invoiceDate = data.invoiceDate;
    ctx.consultation.invoiced = true;
    // TODO: asignar número de factura
    await ctx.consultation.save();
    ctx.status = 200;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {doctor: ctx.doctor._id, consultation: ctx.consultation._id}).href);
    return next();

  });


  // Consultation assign Voucher
  router.get(router.routesList["consultationAssignVoucher"].name, router.routesList["consultationAssignVoucher"].href, async (ctx, next) => {

    if (ctx.consultation._associatedVoucher) {
      ctx.throw(400, 'La consulta ya tiene un bono asociado. No se puede asociar a otro.');
    }

    if (ctx.consultation.invoiced) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede asociar a un bono.');
    }

    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultationAssignVoucher"], {consultation: ctx.consultation._id, doctor: ctx.doctor._id}).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["consultationAssignVoucher"], {consultation: ctx.consultation._id, doctor: ctx.doctor._id}).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));

    // Collection template
    col.template = {data: []};
    col.template.data.push({
      prompt: 'Bono asociado',
      name: 'associatedVoucher',
      value: Date.now(),
      type: 'select',
      suggest: {
        related: 'voucherList',
        value: '_id',
        //TODO
        text: '_id'
      }
    });


    // Collection related
    col.related = {};

    var voucher_list = await PatientVoucher.find({patient: ctx.consultation.patient._id});
    col.related.voucherList = voucher_list.map(function (doc) {
      var d = {};
      d._id = doc._id;
      // TODO
      return d;
    });

    ctx.body = {collection: col};
    return next();

  });

  // Post assigned Voucher
  router.post(router.routesList["consultationAssignVoucher"].href, async (ctx, next) => {

    if (ctx.consultation._associatedVoucher) {
      ctx.throw(400, 'La consulta ya tiene un bono asociado. No se puede asociar a otro.');
    }

    if (ctx.consultation.invoiced) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede asociar a un bono.');
    }

    var data = await parseTemplate(ctx);
    ctx.consultation._associatedVoucher = data.associatedVoucher;
    // TODO: asignar número de factura
    await ctx.consultation.save();
    ctx.status = 200;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {doctor: ctx.doctor._id, consultation: ctx.consultation._id}).href);
    return next();

  });
}
