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
    col.title = ctx.getLinkCJFormat(router.routesList["patientVouchers"], {patient: ctx.patient._id}).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));

	  // Items
	  col.items = patientVoucherList.map(function(p) {
      var item = {};

	    // Item data
      item.data = PatientVoucher.objToCJ(p.patientVoucherToCJ());

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["patientVoucher"], {patient: ctx.patient._id, patientVoucher: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (patientVoucherList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay bonos para este paciente");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = PatientVoucher.template_suggest();


    // Related
    col.related = {};
    col.related.patientlist = [];
    col.related.patientlist = await Patient.find() ;
    col.related.consultationVoucherList = [];
    col.related.consultationVoucherList = await ConsultationVoucherType.find() ;

	  // Return collection object
    return col;

  }

  // Parameter patientVoucher
  router.param('patientVoucher', async (id, ctx, next) => {
    ctx.patientVoucher = await PatientVoucher.findById(id);
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
    var patientVoucherData = await CJUtils.parseTemplate(ctx);
    await PatientVoucher.updateById(ctx.patientVoucher, patientVoucherData);
    var patientVouchers = await PatientVoucher.find();
    var col= await renderCollectionPatientVouchers(ctx, patientVouchers);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["patientVouchers"].href, async (ctx,next) => {
    var patientVoucherData = await CJUtils.parseTemplate(ctx);
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
