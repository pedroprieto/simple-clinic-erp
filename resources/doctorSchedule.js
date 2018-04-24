// OpeningHours resource
var OpeningHour = require('../models/openinghour');
var CJUtils = require('../aux/CJUtils');

module.exports = function(router) {

  function renderCollectionOpeningHours(ctx, openingHourList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: ctx.doctor._id}).href;

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: ctx.doctor._id}).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

    var doctor_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
    doctor_link.prompt = ctx.doctor.fullName;
    col.links.push(doctor_link);

	  // Items
	  col.items = openingHourList.map(function(p) {

      var item = {};
	    // Item data
      item.data = OpeningHour.toCJ(ctx.i18n, p);

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
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay horario para el médico");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
    col.template = {};
	  col.template.data = OpeningHour.getTemplate(ctx.i18n);

    // Related
    col.related = {};
    col.related.dayOfWeekList = OpeningHour.schema.obj['dayOfWeek'].enum.map(function(el) {
      return {
        value: el,
        text: ctx.i18n.__(el)
      };
    });

	  // Return collection object
    return col;

  }

  // Parameter openingHour
  router.param('openingHour', async (id, ctx, next) => {
    ctx.openingHour = await OpeningHour.findById(id);
    if (!ctx.openingHour) {
      ctx.throw(404,'Recurso no encontrado');
    }
    return next();
  });

  // GET doctor's schedule
  router.get(router.routesList["doctorSchedule"].name, router.routesList["doctorSchedule"].href, async (ctx, next) => {
    var col= renderCollectionOpeningHours(ctx, ctx.doctor._schedule);
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
    var doc = await OpeningHour.delById(ctx.openingHour._id);
    ctx.status = 200;
    return next();

  });

  // PUT item
  router.put(router.routesList["doctorScheduleOpeningHour"].name, router.routesList["doctorScheduleOpeningHour"].href, async (ctx, next) => {
    var openingHourData= CJUtils.parseTemplate(ctx);
    var opHour = ctx.openingHour;
    var updatedHour = await opHour.updateOpeningHour(openingHourData);
    var hours = [];
    hours.push(updatedHour);
    var col= renderCollectionOpeningHours(ctx, hours);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["doctorSchedule"].href, async (ctx,next) => {
    var doctor = ctx.doctor;
    var openingHourData= CJUtils.parseTemplate(ctx);
    var p = new OpeningHour(openingHourData);
    var psaved = await p.save();
    doctor._schedule.push(p._id);
    var dsaved = await doctor.save();
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["doctorScheduleOpeningHour"], {doctor: doctor._id, openingHour: p._id}).href);
    return next();
  });
}
