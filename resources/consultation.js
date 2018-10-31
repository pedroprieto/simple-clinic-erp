// Consultations resource
var Consultation = require('../models/consultation');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');
var Room = require('../models/room');
var MedicalProcedure = require('../models/medicalprocedure');
var Moment = require('moment');
var PatientVoucher = require('../models/patientVoucher');
var Invoice = require('../models/invoice');
var CJUtils = require('../aux/CJUtils');

module.exports = function(router) {

  function renderCollectionConsultations(ctx, consultationList) {
    var col = {};
    col.version = "1.0";

    if (ctx.consultation)
      col.title = ctx.i18n.__("Consulta de ") + ctx.consultation.patient.fullName;

    if (ctx.patient)
      col.title = ctx.i18n.__("Consultas de ") + ctx.patient.fullName;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

	  // Items
	  col.items = consultationList.map(function(p) {
      var item = {};

	    // Item data
      item.data = Consultation.toCJ(ctx.i18n, p);

      // Check if invoice or voucher associated
      if (p.invoice || p.associatedVoucher)
        item.readOnly = true;

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["consultation"], {consultation: p._id}).href;

	    // Item links
      item.links = [];
      if ((!p.invoice) && (!p.associatedVoucher)) {
        item.links.push(ctx.getLinkCJFormat(router.routesList["consultationAssignInvoice"], {consultation: p._id}));
        item.links.push(ctx.getLinkCJFormat(router.routesList["consultationAssignVoucher"], {consultation: p._id}));
      }

      if (p.associatedVoucher) {
        item.links.push(ctx.getLinkCJFormat(router.routesList["patientVoucher"], {patient: p.patient._id, patientVoucher: p.associatedVoucher._id}));
        item.links.push(ctx.getLinkCJFormat(router.routesList["consultationDeleteVoucher"], {consultation: p._id}));
      }

      if (p.invoice)
        item.links.push(ctx.getLinkCJFormat(router.routesList["invoice"], {invoice: p.invoice}));


	    return item;
	  });

	  // If no items
	  if (consultationList.length == 0) {
	    var item = {};
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay consultas");
	    item.data.push(d);
	    col.items.push(item);
	  }

    // Meta
    col.meta = {};
    // col.meta.availableHours = [];
    // var limitHours = ctx.doctor._schedule.reduce(function(prev, sch) {
    //   var ret = prev;
    //   if (sch.opens < prev.from) {
    //     ret.from= sch.opens;
    //   }
    //   if (sch.closes > prev.to) {
    //     ret.to = sch.closes;
    //   }
    //   return ret;
    // },{from: '23:59', to: '00:00'});
    // // console.log(limitHours);

    // var init_hour = Moment('2018-01-01 ' + limitHours.from);
    // while (init_hour.format('HH:mm') < limitHours.to) {
    //   col.meta.availableHours.push(init_hour.format('HH:mm'));
    //   init_hour.add(30, 'm');
    // }
    // console.log(col.meta.availableHours);
    // console.log(init_hour.format('HH:mm'));
    // console.log(init_hour);
    // console.log(init_hour.add(30, 'm'));

	  // Return collection object
    return col;

  }

  // Parameter consultation
  router.param('consultation', async (id, ctx, next) => {
    ctx.consultation = await Consultation.findById(id);
    if (!ctx.consultation) {
      ctx.throw(404,ctx.i18n.__('Recurso no encontrado'));
    }
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
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: ctx.doctor._id}).prompt);

    // Doctor link
    var back_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
    back_link.prompt = ctx.doctor.fullName;
    back_link.rel = "collection up";
    col.links.push(back_link);

    // Pagination links
    var l;
    l = ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: cur_isoweekdate}});
    l.rel = 'current';
    l.prompt = ctx.i18n.__('Semana actual');
    col.links.push(l);

    l = ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: previousisoweekdate}});
    l.rel = 'prev';
    l.prompt = ctx.i18n.__('Semana anterior');
    col.links.push(l);

    l = ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: nextisoweekdate}});
    l.rel = 'next';
    l.prompt = ctx.i18n.__('Semana siguiente');
    col.links.push(l);

	  // Template
    // col.template = {};
	  // col.template.data = Consultation.getTemplate(ctx.i18n);

    // Meta current Week
    col.meta.currentWeek = isoweekdate;
    col.meta.listOfDays = [];

    var begin = displayed_date.clone().startOf('isoWeek').isoWeekday();
    var wend = displayed_date.clone().endOf('isoWeek').isoWeekday();
    var d = displayed_date.startOf('week');
    while (begin <= wend) {
      col.meta.listOfDays.push(d.format('YYYY-MM-DD'));
      d.add(1, 'days');
      begin++;
    }

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
    col.href= ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["patientConsultations"], {patient: ctx.patient._id}).prompt);

	  // Patient Link
    var patient_link = ctx.getLinkCJFormat(router.routesList["patient"], {patient: ctx.patient._id});
    patient_link.prompt = ctx.i18n.__("Datos personales"); 
    col.links.push(patient_link);
    // Patient Vouchers
    col.links.push(ctx.getLinkCJFormat(router.routesList["patientVouchers"], {patient: ctx.patient._id}));
    // Patient consultations
    col.links.push(ctx.getLinkCJFormat(router.routesList["patientConsultations"], {patient: ctx.patient._id}));
    // Patient invoices
    col.links.push(ctx.getLinkCJFormat(router.routesList["patientInvoices"], {patient: ctx.patient._id}));
    // Patient attachments
    col.links.push(ctx.getLinkCJFormat(router.routesList["patientAttachments"], {patient: ctx.patient._id}));

    ctx.body = {collection: col};
    return next();

  });


  // GET item
  router.get(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
	  var consultations = [];
	  consultations.push(ctx.consultation);
    var col = await renderCollectionConsultations(ctx, consultations);
    delete col.href;
    // TODO: improve
    col.items[0].links.push(ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.consultation.doctor._id}));
    col.items[0].links.push(ctx.getLinkCJFormat(router.routesList["patient"], {patient: ctx.consultation.patient._id}));
	  // Template
    col.template = {};
	  col.template.data = Consultation.getTemplate(ctx.i18n);
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
	  var consultations = [];
	  consultations.push(aa);
    var col = renderCollectionConsultations(ctx, consultations);
    ctx.body = {collection: col};
    ctx.status = 200;
    return next();
  });


  // Consultations select patient
  router.get(router.routesList["consultations_select_patient"].name, router.routesList["consultations_select_patient"].href, async (ctx,next) => {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["patients"]).href;

    // Message
    col.message = ctx.i18n.__("Fecha: ") + "<b>" + Moment(ctx.date).format('llll') + "</b>";

	  // Collection title
    col.title = ctx.i18n.__("Seleccionar paciente para la consulta");

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

    // Back link
    var back_link = ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id});
    back_link.prompt = ctx.i18n.__("Volver");
    back_link.rel = "collection prev";
    col.links.push(back_link);

	  // Items
    var patientList = await Patient.list(ctx.query);
	  col.items = patientList.map(function(p) {

      var item = {};
      item.readOnly = true;
	    // Item data
      item.data = Patient.toCJ(ctx.i18n, p);

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
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay pacientes");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries
    col.queries = [];
	  col.queries.push(
	    {
		    href: ctx.getLinkCJFormat(router.routesList["consultations_select_patient"], {doctor: ctx.doctor._id, date: ctx.date}).href,
		    rel: "search",
		    name: "searchpatient",
		    prompt: ctx.i18n.__("Buscar paciente"),
		    data: [
		      {
			      name: "patientData",
			      value: ctx.query.patientData || "",
			      prompt: ctx.i18n.__("Búsqueda por texto"),
            type: 'text'
		      }
		    ]
	    }
	  );

	  // Template
    col.template = {};
	  col.template.data = Patient.getTemplate(ctx.i18n);
    col.template.data.push(
      {
		    name : 'nextStep',
		    value: ctx.getLinkCJFormat(router.routesList["consultations_select_patient"], {doctor: ctx.doctor._id, date: ctx.date}).href,
        prompt : ctx.i18n.__('Siguiente paso'),
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
    col.title = ctx.i18n.__("Seleccionar tipo de consulta");
    col.message = ctx.i18n.__("Fecha: ") + "<b>" + Moment(ctx.date).format('llll') + "</b>";
    col.message += "<br>" + ctx.i18n.__("Paciente: ") + "<b>" + ctx.patient.fullName + "</b>";

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));
    // Back link
    var back_link = ctx.getLinkCJFormat(router.routesList["consultations_select_patient"], {doctor: ctx.doctor._id, date: ctx.date});
    back_link.prompt = ctx.i18n.__("Volver");
    back_link.rel = "collection prev";
    col.links.push(back_link);

	  // Items
    var medProcList = await MedicalProcedure.list();
	  col.items = medProcList.map(function(p) {

      var item = {};
      item.readOnly = true;
	    // Item data
      item.data = MedicalProcedure.toCJ(ctx.i18n, p);

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
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay tipos de consulta creadas");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
    col.template = {};
	  col.template.data = MedicalProcedure.getTemplate(ctx.i18n);
    col.template.data.push(
      {
		    name : 'nextStep',
		    value: ctx.getLinkCJFormat(router.routesList["consultations_select_medProc"], {doctor: ctx.doctor._id, date: ctx.date, patient: ctx.patient._id}).href,
        prompt : ctx.i18n.__('Siguiente paso'),
        type: 'hidden'
      });

    // Related
    col.related = {};
    col.related.roomlist = [];
    col.related.roomlist = await Room.list() ;

	  // Return collection object
    ctx.body = {collection: col};
    return next();


  });

  // Template to create consultation
  router.get(router.routesList["consultations_create"].name, router.routesList["consultations_create"].href, async (ctx,next) => {
    var col = {};
    col.version = "1.0";
    col.type = "template";

	  // Collection href
    col.href = ctx.getLinkCJFormat(router.routesList["consultations_create"], {doctor: ctx.doctor._id, date: ctx.date, patient: ctx.patient._id, medicalprocedure: ctx.medicalProcedure._id}).href;

    // Collection title
    col.title = ctx.i18n.__("Crear consulta");
    col.message = ctx.i18n.__("Fecha: ") + "<b>" + Moment(ctx.date).format('llll') + "</b>";
    col.message += "<br>" + ctx.i18n.__("Paciente: ") + "<b>" + ctx.patient.fullName + "</b>";
    col.message += "<br>" + ctx.i18n.__("Tipo de consulta: ") + "<b>" + ctx.medicalProcedure.name + "</b>";

    // Collection links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));
    // Back link
    var back_link = ctx.getLinkCJFormat(router.routesList["consultations_select_medProc"], {doctor: ctx.doctor._id, date: ctx.date, patient: ctx.patient._id});
    back_link.prompt = ctx.i18n.__("Volver");
    back_link.rel = "collection prev";
    col.links.push(back_link);

	  // Template
    col.template = {data: []};
    col.template.data.push(
      {
        prompt: ctx.i18n.__("Crear consulta"),
        name: "confirm",
        value: ctx.i18n.__("Crear consulta para el paciente ") + "<b>" + ctx.patient.fullName + "</b>" + ctx.i18n.__(" con fecha ") + "<b>" + Moment(ctx.date).format('llll') + "</b>",
        type: 'notification'
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


  // Consultation assign Invoice
  router.get(router.routesList["consultationAssignInvoice"].name, router.routesList["consultationAssignInvoice"].href, async (ctx, next) => {

    if (ctx.consultation.associatedVoucher) {
      ctx.throw(400, 'La consulta tiene un bono asociado. No se puede crear la factura.');
    }

    if (ctx.consultation.invoice) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede crear la factura.');
    }

    var col = {};
    col.version = "1.0";
    col.type = "template";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultationAssignInvoice"], {consultation: ctx.consultation._id}).href;

	  // Collection title
    // col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["consultationAssignInvoice"], {consultation: ctx.consultation._id}).prompt);
    col.title = ctx.i18n.__("Facturar consulta de ") + ctx.consultation.patient.fullName + " - " + ctx.consultation.dateLocalized;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

    // Collection template
    col.template = {data: []};
    col.template.data.push({prompt: ctx.i18n.__('Fecha de factura'), name: 'date', value: Moment().format('YYYY-MM-DD'), type: 'date'});
    col.template.data.push({prompt: ctx.i18n.__('Precio final (con IVA)'), name: 'price', value: ctx.consultation.medicalProcedure.price, type: 'number', step: '0.01'});
    col.template.data.push({prompt: ctx.i18n.__('IVA') + ' %', name: 'vat', value: ctx.consultation.medicalProcedure.vat, type: 'number'});
    col.template.data.push({prompt: ctx.i18n.__('Retención IRPF') + ' %', name: 'incomeTax', value: 0, type: 'number'});

    ctx.body = {collection: col};
    return next();

  });

  // Post assigned Invoice
  router.post(router.routesList["consultationAssignInvoice"].href, async (ctx, next) => {

    if (ctx.consultation.associatedVoucher) {
      ctx.throw(400, 'La consulta tiene un bono asociado. No se puede crear la factura.');
    }

    if (ctx.consultation.invoice) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede crear la factura.');
    }

    var data = await CJUtils.parseTemplate(ctx);
    var p = new Invoice();
    p.date = data.date;
    p.customer= ctx.consultation.patient._id;
    p.customerName = ctx.consultation.patient.fullName;
    p.seller = ctx.consultation.doctor._id;
    p.sellerName = ctx.consultation.doctor.fullName;
    p.incomeTax = data.incomeTax;
    p.orderItems = [];
    p.orderItems.push(
      {
        kind: 'Consultation',
        price: data.price,
        tax: data.vat,
        description: ctx.consultation.medicalProcedure.name,
        item: ctx.consultation._id
      }
    );

    var psaved = await p.save();
    ctx.consultation.invoice = psaved._id;
    var csaved = await ctx.consultation.save();
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {consultation: ctx.consultation._id}).href);
    return next();

  });


  // Consultation assign Voucher
  router.get(router.routesList["consultationAssignVoucher"].name, router.routesList["consultationAssignVoucher"].href, async (ctx, next) => {

    if (ctx.consultation.associatedVoucher) {
      ctx.throw(400, 'La consulta ya tiene un bono asociado. No se puede asociar a otro.');
    }

    if (ctx.consultation.invoice) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede asociar a un bono.');
    }

    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultationAssignVoucher"], {consultation: ctx.consultation._id}).href;

    col.type = "template";

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["consultationAssignVoucher"], {consultation: ctx.consultation._id}).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

    // Collection template
    col.template = {data: []};
    col.template.data.push({
      prompt: ctx.i18n.__('Bono asociado'),
      name: 'associatedVoucher',
      value: "",
      type: 'select',
      suggest: {
        related: 'voucherList',
        value: '_id',
        text: 'text'
      }
    });


    // Collection related
    col.related = {};

    var voucher_list = await PatientVoucher.findAvailableByPatient(ctx.consultation.patient._id);
    col.related.voucherList = voucher_list.map(function (doc) {
      var d = {};
      d._id = doc._id;
      d.text = doc.consultationVoucherType.name;
      return d;
    });

    ctx.body = {collection: col};
    return next();

  });

  // Post assigned Voucher
  router.post(router.routesList["consultationAssignVoucher"].href, async (ctx, next) => {

    if (ctx.consultation.associatedVoucher) {
      ctx.throw(400, 'La consulta ya tiene un bono asociado. No se puede asociar a otro.');
    }

    if (ctx.consultation.invoice) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede asociar a un bono.');
    }

    // Get associatedVoucher
    var data = await CJUtils.parseTemplate(ctx);
    var associatedVoucher = await PatientVoucher.findById(data.associatedVoucher);
    if (associatedVoucher.remainingConsultations ==0) {
      ctx.throw(400, 'El abono ha gastado todas las consultas.');
    }

    ctx.consultation.associatedVoucher = data.associatedVoucher;
    // TODO: asignar número de factura
    var con = await ctx.consultation.save();

    // Update voucher consultation list
    await associatedVoucher.addConsultation(con._id);
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {consultation: ctx.consultation._id}).href);
    return next();

  });


  // Consultation delete assigned Voucher
  router.get(router.routesList["consultationDeleteVoucher"].name, router.routesList["consultationDeleteVoucher"].href, async (ctx, next) => {

    if (! ctx.consultation.associatedVoucher) {
      ctx.throw(400, 'La consulta no tiene un bono asociado.');
    }

    if (ctx.consultation.invoice) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada.');
    }

    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultationDeleteVoucher"], {consultation: ctx.consultation._id}).href;

    col.type = "template";

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["consultationDeleteVoucher"], {consultation: ctx.consultation._id}).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

    // Collection template
    col.template = {data: []};
    col.template.data.push({
      prompt: ctx.i18n.__('Eliminar bono asociado: ' + ctx.consultation.associatedVoucher.name),
      name: 'associatedVoucher',
      value: ctx.consultation.associatedVoucher._id,
      type: "hidden",
    });

    ctx.body = {collection: col};
    return next();

  });

  // Post delete assigned Voucher
  router.post(router.routesList["consultationDeleteVoucher"].href, async (ctx, next) => {

    if (! ctx.consultation.associatedVoucher) {
      ctx.throw(400, 'La consulta no tiene un bono asociado.');
    }

    if (ctx.consultation.invoice) {
      ctx.throw(400, 'La consulta ya tiene una factura asociada. No se puede asociar a un bono.');
    }

    // Get associatedVoucher
    var data = await CJUtils.parseTemplate(ctx);
    var associatedVoucher = await PatientVoucher.findById(data.associatedVoucher);
    if (! associatedVoucher )
      ctx.throw(400, 'No existe el bono indicado.');

    ctx.consultation.associatedVoucher = null;
    var con = await ctx.consultation.save();

    // Update voucher consultation list
    await associatedVoucher.removeConsultation(con._id);
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {consultation: ctx.consultation._id}).href);
    return next();

  });
}
