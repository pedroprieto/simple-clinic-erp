// Doctors resource
var Doctor = require('../models/doctor');

module.exports = function(router) {

  function renderCollectionDoctors(ctx, doctorList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["doctors"]).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["doctors"]).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));

	  // Items
	  col.items = doctorList.map(function(p) {

      var item = {};
	    // Item data
	    item.data = p.toObject({transform: Doctor.tx_cj});

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: p._id}).href;

	    // Item links
      item.links = [];
      // Doctor schedule link
      item.links.push(ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: p._id}));

	    return item;
	  });

	  // If no items
	  if (doctorList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay médicos");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = Doctor.template();

	  // Return collection object
    return col;

  }

  // Parameter doctor
  router.param('doctor', async (id, ctx, next) => {
    ctx.doctor = await Doctor.findOne({_id: id});
    if (!ctx.doctor) {
      ctx.throw(404,'Recurso no encontrado');
    }
    return next();
  });

  // GET Doctor list
  router.get(router.routesList["doctors"].name, router.routesList["doctors"].href, async (ctx, next) => {
    var doctors = await Doctor.find();
    var col= renderCollectionDoctors(ctx, doctors);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["doctor"].name, router.routesList["doctor"].href, async (ctx, next) => {
    var doctor = ctx.doctor;
	  var doctors = [];
	  doctors.push(doctor);
    var col = renderCollectionDoctors(ctx, doctors);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["doctor"].name, router.routesList["doctor"].href, async (ctx, next) => {
    var doc = await Doctor.remove(ctx.doctor);
    var doctors = await Doctor.find();
    var col= renderCollectionDoctors(ctx, doctors);
    ctx.body = {collection: col};
    return next();

  });

  // Aux function for PUT and POST
  async function parseTemplate(ctx) {
	  if ((ctx.request.body.template === undefined) || (ctx.request.body.template.data === undefined) || (!Array.isArray(ctx.request.body.template.data))) {
      var doctors = await Doctor.find();
      var col= renderCollectionDoctors(ctx, doctors);
      ctx.body = {collection: col};
      ctx.throw(400, 'Los datos no están en formato CJ');
	  }

    var data = ctx.request.body.template.data;

    // Convert CJ format to JS object
	  var doctorData = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	  } , {});

    return doctorData;
  }

  // PUT item
  router.put(router.routesList["doctor"].name, router.routesList["doctor"].href, async (ctx, next) => {
    var doctorData= await parseTemplate(ctx);
    await ctx.doctor.update(doctorData);
    var doctors = await Doctor.find();
    var col= renderCollectionDoctors(ctx, doctors);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["doctors"].href, async (ctx,next) => {
    var doctorData= await parseTemplate(ctx);
    var p = new Doctor(doctorData);
    var psaved = await p.save();
    var doctors = await Doctor.find();
    var col= renderCollectionDoctors(ctx, doctors);
    ctx.body = {collection: col};
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: psaved._id}).href);
    return next();
  });
}
