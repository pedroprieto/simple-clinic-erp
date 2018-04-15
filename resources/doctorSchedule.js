// OpeningHours resource
var OpeningHour = require('../models/openinghour');

module.exports = function(router) {

  function renderCollectionOpeningHours(ctx, openingHourList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: ctx.doctor._id}).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: ctx.doctor._id}).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));

	  // Items
	  col.items = openingHourList.map(function(p) {

      var item = {};
	    // Item data
	    item.data = p.toObject({transform: OpeningHour.tx_cj});

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["doctorScheduleOpeningHour"], {doctor: ctx.doctor._id, openingHour: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (openingHourList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay horario para el médico");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = OpeningHour.template();

	  // Return collection object
    return col;

  }

  // Parameter openingHour
  router.param('openingHour', async (id, ctx, next) => {
    ctx.openingHour = await OpeningHour.findOne({_id: id});
    if (!ctx.openingHour) {
      ctx.throw(404,'Recurso no encontrado');
    }
    return next();
  });

  // GET doctor's schedule
  router.get(router.routesList["doctorSchedule"].name, router.routesList["doctorSchedule"].href, async (ctx, next) => {
    var doctorPopulated = await ctx.doctor.populate('_schedule').execPopulate();
    var col= renderCollectionOpeningHours(ctx, doctorPopulated._schedule);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["doctorScheduleOpeningHour"].name, router.routesList["doctorScheduleOpeningHour"].href, async (ctx, next) => {
    var openingHour = ctx.openingHour;
	  var doctorSchedule = [];
	  doctorSchedule.push(openingHour);
    var col = renderCollectionOpeningHours(ctx, doctorSchedule);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["doctorScheduleOpeningHour"].name, router.routesList["doctorScheduleOpeningHour"].href, async (ctx, next) => {
    var doc = await OpeningHour.remove(ctx.openingHour);
    var doctorPopulated = await ctx.doctor.populate('_schedule').execPopulate();
    var col= renderCollectionOpeningHours(ctx, doctorPopulated._schedule);
    ctx.body = {collection: col};
    return next();

  });

  // Aux function for PUT and POST
  async function parseTemplate(ctx) {
	  if ((ctx.request.body.template === undefined) || (ctx.request.body.template.data === undefined) || (!Array.isArray(ctx.request.body.template.data))) {
      var doctorPopulated = await ctx.doctor.populate('_schedule').execPopulate();
      var col= renderCollectionOpeningHours(ctx, doctorPopulated._schedule);
      ctx.body = {collection: col};
      ctx.throw(400, 'Los datos no están en formato CJ');
	  }

    var data = ctx.request.body.template.data;

    // Convert CJ format to JS object
	  var openingHourData = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	  } , {});

    return openingHourData;
  }

  // PUT item
  router.put(router.routesList["doctorScheduleOpeningHour"].name, router.routesList["doctorScheduleOpeningHour"].href, async (ctx, next) => {
    var openingHourData= await parseTemplate(ctx);
    await ctx.openingHour.update(openingHourData);
    var doctorPopulated = await ctx.doctor.populate('_schedule').execPopulate();
    var col= renderCollectionOpeningHours(ctx, doctorPopulated._schedule);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["doctorSchedule"].href, async (ctx,next) => {
    var openingHourData= await parseTemplate(ctx);
    var p = new OpeningHour(openingHourData);
    var psaved = await p.save();
    ctx.doctor._schedule.push(p._id);
    var dsaved = await ctx.doctor.save();
    var doctorPopulated = await ctx.doctor.populate('_schedule').execPopulate();
    var col= renderCollectionOpeningHours(ctx, doctorPopulated._schedule);
    ctx.body = {collection: col};
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["doctorScheduleOpeningHour"], {doctor: ctx.doctor._id, openingHour: psaved._id}).href);
    return next();
  });
}
