// ConsultationVoucherTypes resource
var ConsultationVoucherType = require('../models/consultationVoucherType');
var MedicalProcedure = require('../models/medicalprocedure');
var CJUtils = require('../aux/CJUtils');

module.exports = function(router) {

  async function renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypeList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultationVoucherTypes"]).href;

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["consultationVoucherTypes"]).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["medicalProcedures"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["consultationVoucherTypes"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["rooms"]));

	  // Items
	  // Item data
	  col.items = consultationVoucherTypeList.map(function(p) {
      var pobj = p.toObject();
      var item = {};

      item.data = ConsultationVoucherType.toCJ(ctx.i18n, p);

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["consultationVoucherType"], {consultationVoucherType: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (consultationVoucherTypeList.length == 0) {
	    var item = {};
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay bonos");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
    col.template = {};
	  col.template.data = MedicalProcedure.getTemplate(ctx.i18n);


    // Related
    col.related = {};
    col.related.medicalProcedurelist = [];
    col.related.medicalProcedurelist = await MedicalProcedure.list() ;

	  // Return collection object
    return col;

  }

  // Parameter consultationVoucherType
  router.param('consultationVoucherType', async (id, ctx, next) => {
    ctx.consultationVoucherType = await ConsultationVoucherType.findById(id);
    if (!ctx.consultationVoucherType) {
      ctx.throw(404,ctx.i18n.__('Recurso no encontrado'));
    }
    return next();
  });

  // GET ConsultationVoucherType list
  router.get(router.routesList["consultationVoucherTypes"].name, router.routesList["consultationVoucherTypes"].href, async (ctx, next) => {
    var consultationVoucherTypes = await ConsultationVoucherType.list();
    var col= await renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypes);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["consultationVoucherType"].name, router.routesList["consultationVoucherType"].href, async (ctx, next) => {
    var consultationVoucherType = ctx.consultationVoucherType;
	  var consultationVoucherTypes = [];
	  consultationVoucherTypes.push(consultationVoucherType);
    var col = await renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypes);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["consultationVoucherType"].name, router.routesList["consultationVoucherType"].href, async (ctx, next) => {
    var doc = await ConsultationVoucherType.delById(ctx.consultationVoucherType._id);
    ctx.status = 200;
    return next();

  });

  // PUT item
  router.put(router.routesList["consultationVoucherType"].name, router.routesList["consultationVoucherType"].href, async (ctx, next) => {
    var consultationVoucherTypeData = CJUtils.parseTemplate(ctx);
    var updatedCVT = await ctx.consultationVoucherType.updateConsultationVoucherType(consultationVoucherTypeData);
    var CVTs = [];
    CVTs.push(updatedCVT);
    var col= await renderCollectionConsultationVoucherTypes(ctx, CVTs);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["consultationVoucherTypes"].href, async (ctx,next) => {
    var consultationVoucherTypeData = CJUtils.parseTemplate(ctx);
    var associated_medicalProcedure = await MedicalProcedure.findById(consultationVoucherTypeData.medicalProcedure);
    if (typeof associated_medicalProcedure === 'undefined') {
      //TODO
      ctx.throw('400', 'Error. Tipo de sesión no válido.');
    } else {
      var p = new ConsultationVoucherType(consultationVoucherTypeData);
      p.medicalProcedure = associated_medicalProcedure._id;

      var psaved = await p.save();
      ctx.status = 201;
      ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultationVoucherType"], {consultationVoucherType: psaved._id}).href);
      return next();
    }
  });
}
