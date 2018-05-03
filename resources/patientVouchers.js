// PatientVouchers resource
var PatientVoucher = require('../models/patientVoucher');
var Patient= require('../models/patient');
var ConsultationVoucherType = require('../models/consultationVoucherType');
var CJUtils = require('../aux/CJUtils');

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

	  // Items
	  col.items = patientVoucherList.map(function(p) {
      var item = {};

	    // Item data
      item.data = PatientVoucher.toCJ(ctx.i18n, p);

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["patientVoucher"], {patient: ctx.patient._id, patientVoucher: p._id}).href;

	    // Item links

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
    var patientVouchers = await PatientVoucher.findByPatient(ctx.patient._id);
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
    var doc = await PatientVoucher.findByIdAndRemove(ctx.patientVoucher._id);
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
      patientVoucherData.patient = ctx.patient._id;
      patientVoucherData.consultationVoucherType = associated_consultationVoucherType._id;
      patientVoucherData.numberOfSessions = associated_consultationVoucherType.numberOfConsultations;
      patientVoucherData.price = associated_consultationVoucherType.price;
      var p = new PatientVoucher(patientVoucherData);
      var psaved = await p.save();
      ctx.status = 201;
      ctx.set('location', ctx.getLinkCJFormat(router.routesList["patientVoucher"], {patient: ctx.patient._id, patientVoucher: psaved._id}).href);
      return next();
    }
  });
}
