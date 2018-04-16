// ConsultationVoucherTypes resource
var ConsultationVoucherType = require('../models/consultationVoucherType');
var MedicalProcedure = require('../models/medicalprocedure');

module.exports = function(router) {

  async function renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypeList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultationVoucherTypes"]).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["consultationVoucherTypes"]).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));

	  // Items
	  // Item data
	  col.items = consultationVoucherTypeList.map(function(p) {
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
          if (d!=='medicalProcedure') {
            dat.value = pobj[d];
          } else {
            dat.value = pobj[d]._id;
            dat.text= pobj[d].name;
          }
          item.data.push(dat);
        }
      }

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["consultationVoucherType"], {consultationVoucherType: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (consultationVoucherTypeList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay bonos");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = ConsultationVoucherType.template_suggest();


    // Related
    col.related = {};
    col.related.medicalProcedurelist = [];
    col.related.medicalProcedurelist = await MedicalProcedure.find() ;

	  // Return collection object
    return col;

  }

  // Parameter consultationVoucherType
  router.param('consultationVoucherType', (id, ctx, next) => {
    ctx.consultationVoucherType = id;
    return next();
  });

  // GET ConsultationVoucherType list
  router.get(router.routesList["consultationVoucherTypes"].name, router.routesList["consultationVoucherTypes"].href, async (ctx, next) => {
    var consultationVoucherTypes = await ConsultationVoucherType.find().populate('medicalProcedure').exec();
    var col= await renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypes);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["consultationVoucherType"].name, router.routesList["consultationVoucherType"].href, async (ctx, next) => {
    var consultationVoucherType = await ConsultationVoucherType.findOne({_id: ctx.consultationVoucherType}).populate('medicalProcedure').exec();
	  var consultationVoucherTypes = [];
	  consultationVoucherTypes.push(consultationVoucherType);
    var col = await renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypes);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["consultationVoucherType"].name, router.routesList["consultationVoucherType"].href, async (ctx, next) => {
    var doc = await ConsultationVoucherType.findByIdAndRemove(ctx.consultationVoucherType);
    var consultationVoucherTypes = await ConsultationVoucherType.find();
    var col= await renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypes);
    ctx.body = {collection: col};
    return next();

  });

  // Aux function for PUT and POST
  async function parseTemplate(ctx) {
	  if ((typeof ctx.request.body.template === 'undefined') || (typeof ctx.request.body.template.data === 'undefined') || (!Array.isArray(ctx.request.body.template.data))) {
      var consultationVoucherTypes = await ConsultationVoucherType.find();
      var col= await renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypes);
      ctx.body = {collection: col};
      ctx.throw(400, 'Los datos no están en formato CJ');
	  }

    var data = ctx.request.body.template.data;

    // Convert CJ format to JS object
	  var consultationVoucherTypeData = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	  } , {});

    return consultationVoucherTypeData;
  }

  // PUT item
  router.put(router.routesList["consultationVoucherType"].name, router.routesList["consultationVoucherType"].href, async (ctx, next) => {
    var consultationVoucherTypeData = await parseTemplate(ctx);
    await ConsultationVoucherType.findByIdAndUpdate(ctx.consultationVoucherType, consultationVoucherTypeData);
    var consultationVoucherTypes = await ConsultationVoucherType.find();
    var col= await renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypes);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["consultationVoucherTypes"].href, async (ctx,next) => {
    var consultationVoucherTypeData = await parseTemplate(ctx);
    var associated_medicalProcedure = await MedicalProcedure.findById(consultationVoucherTypeData.medicalProcedure);
    if (typeof associated_medicalProcedure === 'undefined') {
      //TODO
      ctx.throw('400', 'Error');
    } else {
      consultationVoucherTypeData.medicalProcedure = associated_medicalProcedure._id;
      var p = new ConsultationVoucherType(consultationVoucherTypeData);
      var psaved = await p.save();
      var consultationVoucherTypes = await ConsultationVoucherType.find().populate('medicalProcedure').exec();
      var col= await renderCollectionConsultationVoucherTypes(ctx, consultationVoucherTypes);
      ctx.body = {collection: col};
      ctx.status = 201;
      ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultationVoucherType"], {consultationVoucherType: psaved._id}).href);
      return next();
    }
  });
}