// MedicalProcedures resource
var MedicalProcedure = require('../models/medicalprocedure');
var Room = require('../models/room');
var CJUtils = require('../aux/CJUtils');

module.exports = function(router) {

  async function renderCollectionMedicalProcedures(ctx, medicalProcedureList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["medicalProcedures"]).href;

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["medicalProcedures"]).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["medicalProcedures"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["consultationVoucherTypes"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["rooms"]));


	  // Items
	  col.items = medicalProcedureList.map(function(p) {

      var item = {};

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["medicalProcedure"], {medicalprocedure: p._id}).href;

	    // Item data
      item.data = MedicalProcedure.toCJ(ctx.i18n, p);

	    // Item links

	    return item;
	  });

	  // If no items
	  if (medicalProcedureList.length == 0) {
	    var item = {};
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay tipos de sesión");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
    col.template = {};
	  col.template.data = MedicalProcedure.getTemplate(ctx.i18n);

    // Related
    col.related = {};
    col.related.roomlist = [];
    col.related.roomlist = await Room.list() ;

	  // Return collection object
    return col;

  }

  // Parameter medicalProcedure
  router.param('medicalprocedure', async (id, ctx, next) => {
    ctx.medicalProcedure = await MedicalProcedure.findById(id);
    if (!ctx.medicalProcedure) {
      ctx.throw(404,ctx.i18n.__('Recurso no encontrado'));
    }
    return next();
  });

  // GET MedicalProcedure list
  router.get(router.routesList["medicalProcedures"].name, router.routesList["medicalProcedures"].href, async (ctx, next) => {
    var medicalProcedures = await MedicalProcedure.list();
    var col= await renderCollectionMedicalProcedures(ctx, medicalProcedures);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["medicalProcedure"].name, router.routesList["medicalProcedure"].href, async (ctx, next) => {
    var medicalProcedure = ctx.medicalProcedure;
	  var medicalProcedures = [];
	  medicalProcedures.push(medicalProcedure);
    var col = await renderCollectionMedicalProcedures(ctx, medicalProcedures);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["medicalProcedure"].name, router.routesList["medicalProcedure"].href, async (ctx, next) => {
    var doc = await MedicalProcedure.delById(ctx.medicalProcedure._id);
    ctx.status = 200;
    return next();

  });

  // PUT item
  router.put(router.routesList["medicalProcedure"].name, router.routesList["medicalProcedure"].href, async (ctx, next) => {
    var medicalProcedureData = CJUtils.parseTemplate(ctx);
    var updatedMedicalProcedure = await ctx.medicalProcedure.updateMedicalProcedure(medicalProcedureData);
    var medProcs = [];
    medProcs.push(updatedMedicalProcedure);
    var col= await renderCollectionMedicalProcedures(ctx, medProcs);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["medicalProcedures"].href, async (ctx,next) => {
    var medicalProcedureData = CJUtils.parseTemplate(ctx);
    var associated_room = await Room.findById(medicalProcedureData.room);
    if (typeof associated_room === 'undefined') {
      //TODO
      ctx.throw('400', 'Error. Sala no válida.');
    } else {
      medicalProcedureData.room = associated_room._id;
      var p = new MedicalProcedure(medicalProcedureData);
      var psaved = await p.save();
      ctx.status = 201;
      // Check nextStep
      // If medicalProcedure created during consultation creation, return to next step
      if (medicalProcedureData.nextStep) {
        ctx.set('location', medicalProcedureData.nextStep + '/' + psaved._id);
      } else {
        ctx.set('location', ctx.getLinkCJFormat(router.routesList["medicalProcedure"], {medicalprocedure: psaved._id}).href);
      }
      return next();
    }
  });
}
