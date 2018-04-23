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
    col.title = ctx.getLinkCJFormat(router.routesList["medicalProcedures"]).prompt;

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
	  col.items = medicalProcedureList.map(function(p) {
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
          if (d!=='room') {
            dat.value = pobj[d];
          } else {
            dat.value = pobj[d]._id;
            dat.text= pobj[d].name;
          }
          item.data.push(dat);
        }
      }

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["medicalProcedure"], {medicalprocedure: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (medicalProcedureList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay salas");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = MedicalProcedure.template_suggest();


    // Related
    col.related = {};
    col.related.roomlist = [];
    col.related.roomlist = await Room.find() ;

	  // Return collection object
    return col;

  }

  // Parameter medicalProcedure
  router.param('medicalprocedure', async (id, ctx, next) => {
    ctx.medicalProcedure = await MedicalProcedure.findOne({_id: id}).populate('room').exec();
    // ctx.medicalProcedure = id;
    return next();
  });

  // GET MedicalProcedure list
  router.get(router.routesList["medicalProcedures"].name, router.routesList["medicalProcedures"].href, async (ctx, next) => {
    var medicalProcedures = await MedicalProcedure.find().populate('room').exec();
    var col= await renderCollectionMedicalProcedures(ctx, medicalProcedures);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["medicalProcedure"].name, router.routesList["medicalProcedure"].href, async (ctx, next) => {
    var medicalProcedure = await MedicalProcedure.findOne({_id: ctx.medicalProcedure}).populate('room').exec();
	  var medicalProcedures = [];
	  medicalProcedures.push(medicalProcedure);
    var col = await renderCollectionMedicalProcedures(ctx, medicalProcedures);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["medicalProcedure"].name, router.routesList["medicalProcedure"].href, async (ctx, next) => {
    var doc = await MedicalProcedure.findByIdAndRemove(ctx.medicalProcedure);
    var medicalProcedures = await MedicalProcedure.find();
    var col= await renderCollectionMedicalProcedures(ctx, medicalProcedures);
    ctx.body = {collection: col};
    return next();

  });

  // PUT item
  router.put(router.routesList["medicalProcedure"].name, router.routesList["medicalProcedure"].href, async (ctx, next) => {
    var medicalProcedureData = await CJUtils.parseTemplate(ctx);
    await MedicalProcedure.findByIdAndUpdate(ctx.medicalProcedure, medicalProcedureData);
    var medicalProcedures = await MedicalProcedure.find();
    var col= await renderCollectionMedicalProcedures(ctx, medicalProcedures);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["medicalProcedures"].href, async (ctx,next) => {
    var medicalProcedureData = await CJUtils.parseTemplate(ctx);
    var associated_room = await Room.findById(medicalProcedureData.room);
    if (typeof associated_room === 'undefined') {
      //TODO
      ctx.throw('400', 'Error');
    } else {
      medicalProcedureData.room = associated_room._id;
      var p = new MedicalProcedure(medicalProcedureData);
      var psaved = await p.save();
      var medicalProcedures = await MedicalProcedure.find().populate('room').exec();
      var col= await renderCollectionMedicalProcedures(ctx, medicalProcedures);
      ctx.body = {collection: col};
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
