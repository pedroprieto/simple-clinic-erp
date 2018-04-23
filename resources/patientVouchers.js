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
	  // Item data
	  col.items = patientVoucherList.map(function(p) {
      var pobj = p.toObject();
      var item = {};
      item.data = [];

      for (var d in pobj) {
	      if (d.substring(0,1) != '_') {
          var dat = {};
          dat.name = d;
          dat.prompt = p.schema.obj[d].promptCJ;
          dat.type = p.schema.obj[d].htmlType;
          // TODO: required
          if (d==='patient') {
            dat.value = pobj[d]._id;
            dat.text= p[d].fullName;
          } else if (d==='consultationVoucherType') {
            dat.value = pobj[d]._id;
            dat.text = p[d].name;
          } else {
            dat.value = pobj[d];
          }
          item.data.push(dat);
        }
      }

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
  router.param('patientVoucher', (id, ctx, next) => {
    ctx.patientVoucher = id;
    return next();
  });

  // GET PatientVoucher list
  router.get(router.routesList["patientVouchers"].name, router.routesList["patientVouchers"].href, async (ctx, next) => {
    var patientVouchers = await PatientVoucher.find().populate(['patient','consultationVoucherType']).exec();
    var col= await renderCollectionPatientVouchers(ctx, patientVouchers);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["patientVoucher"].name, router.routesList["patientVoucher"].href, async (ctx, next) => {
    var patientVoucher = await PatientVoucher.findOne({_id: ctx.patientVoucher}).populate(['patient','consultationVoucherType']).exec();
	  var patientVouchers = [];
	  patientVouchers.push(patientVoucher);
    var col = await renderCollectionPatientVouchers(ctx, patientVouchers);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["patientVoucher"].name, router.routesList["patientVoucher"].href, async (ctx, next) => {
    var doc = await PatientVoucher.findByIdAndRemove(ctx.patientVoucher);
    var patientVouchers = await PatientVoucher.find();
    var col= await renderCollectionPatientVouchers(ctx, patientVouchers);
    ctx.body = {collection: col};
    return next();

  });

  // PUT item
  router.put(router.routesList["patientVoucher"].name, router.routesList["patientVoucher"].href, async (ctx, next) => {
    var patientVoucherData = await CJUtils.parseTemplate(ctx);
    await PatientVoucher.findByIdAndUpdate(ctx.patientVoucher, patientVoucherData);
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
      var p = new PatientVoucher(patientVoucherData);
      var psaved = await p.save();
      var patientVouchers = await PatientVoucher.find().populate(['patient', 'consultationVoucherType']).exec();
      var col= await renderCollectionPatientVouchers(ctx, patientVouchers);
      ctx.body = {collection: col};
      ctx.status = 201;
      ctx.set('location', ctx.getLinkCJFormat(router.routesList["patientVoucher"], {patient: ctx.patient._id, patientVoucher: psaved._id}).href);
      return next();
    }
  });
}
