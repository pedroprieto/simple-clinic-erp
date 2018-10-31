// PatientVouchers resource
var PatientVoucher = require('../models/patientVoucher');
var Patient= require('../models/patient');
var Doctor = require('../models/doctor');
var ConsultationVoucherType = require('../models/consultationVoucherType');
var CJUtils = require('../aux/CJUtils');
var Moment = require('moment');
var Invoice = require('../models/invoice');

module.exports = function(router) {

  async function renderCollectionPatientVouchers(ctx, patientVoucherList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["patientVouchers"], {patient: ctx.patient._id}).href;

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["patientVouchers"], {patient: ctx.patient._id}).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

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

	  // Items
	  col.items = patientVoucherList.map(function(p) {
      var item = {};

	    // Item data
      item.data = PatientVoucher.toCJ(ctx.i18n, p);

      // Check if invoice associated
      if (p.invoice)
        item.readOnly = true;

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["patientVoucher"], {patient: ctx.patient._id, patientVoucher: p._id}).href;

	    // Item links
      item.links = [];
      if (!p.invoice) {
        item.links.push(ctx.getLinkCJFormat(router.routesList["voucherAssignInvoice"], {patient: ctx.patient._id, patientVoucher: p._id}));
      } else {
        item.links.push(ctx.getLinkCJFormat(router.routesList["invoice"], {invoice: p.invoice}));
      }

	    return item;
	  });

	  // If no items
	  if (patientVoucherList.length == 0) {
	    var item = {};
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay bonos para este paciente");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
    col.template = {};
	  col.template.data = PatientVoucher.getTemplate(ctx.i18n);

    // Related
    col.related = {};
    col.related.consultationVoucherList = [];
    col.related.consultationVoucherList = await ConsultationVoucherType.list();

	  // Return collection object
    return col;

  }

  // Parameter patientVoucher
  router.param('patientVoucher', async (id, ctx, next) => {
    ctx.patientVoucher = await PatientVoucher.findById(id);
    if (!ctx.patientVoucher) {
      ctx.throw(404,ctx.i18n.__('Recurso no encontrado'));
    }
    return next();
  });

  // GET PatientVoucher list
  router.get(router.routesList["patientVouchers"].name, router.routesList["patientVouchers"].href, async (ctx, next) => {
    var patientVouchers = await PatientVoucher.findAvailableByPatient(ctx.patient._id);
    var col= await renderCollectionPatientVouchers(ctx, patientVouchers);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["patientVoucher"].name, router.routesList["patientVoucher"].href, async (ctx, next) => {
	  var patientVouchers = [];
	  patientVouchers.push(ctx.patientVoucher);
    var col = await renderCollectionPatientVouchers(ctx, patientVouchers);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["patientVoucher"].name, router.routesList["patientVoucher"].href, async (ctx, next) => {
    var doc = await PatientVoucher.delById(ctx.patientVoucher._id);
    ctx.status = 200;
    return next();

  });

  // PUT item
  router.put(router.routesList["patientVoucher"].name, router.routesList["patientVoucher"].href, async (ctx, next) => {
    var patientVoucherData = CJUtils.parseTemplate(ctx);
    var updatedVoucher = await ctx.patientVoucher.updatePatientVoucher(patientVoucherData);
    var vouchers = [];
    vouchers.push(updatedVoucher);
    var col= await renderCollectionPatientVouchers(ctx, vouchers);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["patientVouchers"].href, async (ctx,next) => {
    var patientVoucherData = CJUtils.parseTemplate(ctx);
    var associated_consultationVoucherType = await ConsultationVoucherType.findById(patientVoucherData.consultationVoucherType);
    if (typeof associated_consultationVoucherType === 'undefined') {
      //TODO
      ctx.throw('400', 'Error');
    } else {
      patientVoucherData.name = associated_consultationVoucherType.name + ' - ' + associated_consultationVoucherType.medicalProcedure.name;
      patientVoucherData.patient = ctx.patient._id;
      patientVoucherData.consultationVoucherType = associated_consultationVoucherType._id;
      patientVoucherData.numberOfSessions = associated_consultationVoucherType.numberOfConsultations;
      patientVoucherData.price = associated_consultationVoucherType.price;
      patientVoucherData.vat = associated_consultationVoucherType.vat;
      var p = new PatientVoucher(patientVoucherData);
      var psaved = await p.save();
      ctx.status = 201;
      ctx.set('location', ctx.getLinkCJFormat(router.routesList["patientVoucher"], {patient: ctx.patient._id, patientVoucher: psaved._id}).href);
      return next();
    }
  });


  // Voucher assign Invoice
  router.get(router.routesList["voucherAssignInvoice"].name, router.routesList["voucherAssignInvoice"].href, async (ctx, next) => {

    if (ctx.patientVoucher.invoice) {
      ctx.throw(400, 'El bono tiene factura asociada. No se puede crear la factura.');
    }

    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["voucherAssignInvoice"], {patient: ctx.patient._id, patientVoucher: ctx.patientVoucher._id}).href;

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["voucherAssignInvoice"], {patient: ctx.patient._id, patientVoucher: ctx.patientVoucher._id}).prompt);

    col.type = "template";

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

    // Collection template
    col.template = {data: []};
    col.template.data.push({prompt: ctx.i18n.__('Fecha de factura'), name: 'date', value: Moment().format('YYYY-MM-DD'), type: 'date'});
    col.template.data.push({prompt: ctx.i18n.__('Precio final (con IVA)'), name: 'price', value: ctx.patientVoucher.price, type: 'number', step: '0.01'});
    col.template.data.push({prompt: ctx.i18n.__('IVA') + ' %', name: 'vat', value: ctx.patientVoucher.vat, type: 'number'});
    col.template.data.push({prompt: ctx.i18n.__('Retención IRPF') + ' %', name: 'incomeTax', value: 0, type: 'number'});
    col.template.data.push({
      prompt: ctx.i18n.__('Médico'),
      name: 'doctor',
      value: "",
      type: 'select',
      suggest: {
        related: 'doctors',
        value: 'value',
        text: 'text'
      }
    });


    // Related
    col.related = {};
    var doctors = await Doctor.list();
    col.related.doctors = doctors.map(function(d) {
      return {
        value: d._id,
        text: d.fullName
      }

    });

    ctx.body = {collection: col};
    return next();

  });


  // Post assigned Invoice
  router.post(router.routesList["voucherAssignInvoice"].href, async (ctx, next) => {

    if (ctx.patientVoucher.invoice) {
      ctx.throw(400, 'El bono ya tiene una factura asociada. No se puede crear la factura.');
    }

    var data = await CJUtils.parseTemplate(ctx);
    var p = new Invoice();
    p.date = data.date;
    p.customer= ctx.patientVoucher.patient._id;
    p.customerName = ctx.patientVoucher.patient.fullName;
    p.seller = data.doctor;
    // TODO
    // Check if exists
    var doc = await Doctor.findById(p.seller);
    p.sellerName = doc.fullName;
    p.incomeTax = data.incomeTax;
    p.orderItems = [];
    p.orderItems.push(
      {
        kind: 'PatientVoucher',
        price: data.price,
        tax: data.vat,
        // TODO: improve
        description: ctx.patientVoucher.consultationVoucherType.name,
        item: ctx.patientVoucher._id
      }
    );

    var psaved = await p.save();
    ctx.patientVoucher.invoice = psaved._id;
    var csaved = await ctx.patientVoucher.save();
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["patientVoucher"], {patient: ctx.patient._id, patientVoucher: ctx.patientVoucher._id}).href);
    return next();

  });
}
