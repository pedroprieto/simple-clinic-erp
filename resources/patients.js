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

	  // Items
	  col.items = patientList.map(function(p) {

      var item = {};
	    // Item data
	    item.data = p.toObject({transform: Patient.tx_cj});

      // i18n
      // TODO
      // item.prompt = ctx.i18n.__(item.prompt);

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
	    d.prompt = ctx.i18n.__("No hay pacientes");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template

	  // Return collection object
	  return {collection: col};

  }

  // Parameter patient
    router.param('patient', (id, ctx, next) => {
      ctx.patient = id;
      return next();
    });

  // GET Patient list
  router.get(router.routesList["patients"].name, router.routesList["patients"].href, (ctx, next) => {

    var patientlist = Patient.find().then(function(patients) {
      var collection = renderCollectionPatients(ctx, patients);
      collection.links = [];
      collection.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
      collection.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
      ctx.body = collection;
      return next();
    });

    return patientlist;

  });

  router.get(router.routesList["patient"].name, router.routesList["patient"].href, async (ctx, next) => {
    var patient = await Patient.findOne({_id: ctx.patient});

	  var patients = [];
	  patients.push(patient);
    var collection = renderCollectionPatients(ctx, patients);
    collection.links = [];
    collection.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    collection.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    ctx.body = collection;
    return next();
  });

  router.post(router.routesList["patients"].href, (ctx,next) => {
	  
	  if ((ctx.request.body.template === undefined) || (ctx.request.body.template.data === undefined) || (!Array.isArray(ctx.request.body.template.data))) {
      ctx.status = 400;
      var col = {};
      col.version = "1.0";
      ctx.body = {collection: col};
      col.items = [];
      var message = {name: 'message', prompt: ctx.i18n.__('Mensaje'), value: ctx.i18n.__('Los datos no están en formato CJ')};
      col.items.push(message);
      //TODO: links
      //TODO: process errors
      return next();
	  }

    var data = ctx.request.body.template.data;

	  // Aprovechamos que Mongoose elimina los campos no definidos en el modelo. Por tanto, no hay que filtrar los datos
	  // Convertimos el formato "template" de collection.json y devolvemos un objecto JavaScript convencional
	  var patientData = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	  } , {});

    var p = new Patient(patientData);
    return p.save().then(function(r) {
      ctx.status = 201;
      ctx.set('location', ctx.getLinkCJFormat(router.routesList["patient"], {patient: r._id}).href);
      return next();
    });

  });
}
