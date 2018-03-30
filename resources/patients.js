// Patients resource
var Patient = require('../models/patient');

module.exports = function(router) {

  function renderCollectionPatients(ctx, patientList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["patients"]).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["patients"]).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));

	  // Items
	  col.items = patientList.map(function(p) {

      var item = {};
	    // Item data
	    item.data = p.toObject({transform: Patient.tx_cj});

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["patient"], {patient: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (patientList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay pacientes");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = Patient.template();

	  // Return collection object
    return col;

  }

  // Parameter patient
  router.param('patient', (id, ctx, next) => {
    ctx.patient = id;
    return next();
  });

  // GET Patient list
  router.get(router.routesList["patients"].name, router.routesList["patients"].href, async (ctx, next) => {
    var patients = await Patient.find();
    var col= renderCollectionPatients(ctx, patients);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["patient"].name, router.routesList["patient"].href, async (ctx, next) => {
    var patient = await Patient.findOne({_id: ctx.patient});
	  var patients = [];
	  patients.push(patient);
    var col = renderCollectionPatients(ctx, patients);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["patient"].name, router.routesList["patient"].href, async (ctx, next) => {
    var doc = await Patient.findByIdAndRemove(ctx.patient);
    var patients = await Patient.find();
    var col= renderCollectionPatients(ctx, patients);
    ctx.body = {collection: col};
    return next();

  });

  // Aux function for PUT and POST
  async function parseTemplate(ctx) {
	  if ((ctx.request.body.template === undefined) || (ctx.request.body.template.data === undefined) || (!Array.isArray(ctx.request.body.template.data))) {
      var patients = await Patient.find();
      var col= renderCollectionPatients(ctx, patients);
      ctx.body = {collection: col};
      ctx.throw(400, 'Los datos no están en formato CJ');
	  }

    var data = ctx.request.body.template.data;

    // Convert CJ format to JS object
	  var patientData = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	  } , {});

    return patientData;
  }

  // PUT item
  router.put(router.routesList["patient"].name, router.routesList["patient"].href, async (ctx, next) => {
    var patientData = await parseTemplate(ctx);
    await Patient.findByIdAndUpdate(ctx.patient, patientData);
    var patients = await Patient.find();
    var col= renderCollectionPatients(ctx, patients);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["patients"].href, async (ctx,next) => {
    var patientData = await parseTemplate(ctx);
    var p = new Patient(patientData);
    var psaved = await p.save();
    var patients = await Patient.find();
    var col= renderCollectionPatients(ctx, patients);
    ctx.body = {collection: col};
    ctx.status = 201;
    ctx.set('location', ctx.getLinkCJFormat(router.routesList["patient"], {patient: psaved._id}).href);
    return next();
  });
}
