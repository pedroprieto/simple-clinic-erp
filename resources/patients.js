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

	    // Item data
	    var item = p.toObject({transform: Patient.tx_cj});

      // i18n
      item.prompt = ctx.i18n.__(item.prompt);

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["patient"], {patient: p._id});

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


  // GET Patient list
  router.get(router.routesList["patients"].name, router.routesList["patients"].href, (ctx, next) => {

    var patientlist = Patient.find().then(function(patients) {
      var collection = renderCollectionPatients(ctx, patients);
      collection.links = [];
      collection.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
      collection.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
      ctx.body = {collection: collection};
      return next();
    });

    return patientlist;

  });

}
