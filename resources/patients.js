// Patients resource
var Patient = require('../models/patient');
var Consultation = require('../models/consultation');
var CJUtils = require('../aux/CJUtils');

module.exports = function(router) {

  function renderCollectionPatients(ctx, patientList, isItem) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["patients"]).href;

	  // Collection title
    col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["patients"]).prompt);

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

	  // Items
	  col.items = patientList.map(function(p) {

      var item = {};
	    // Item data
      item.data = Patient.toCJ(ctx.i18n, p);

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["patient"], {patient: p._id}).href;

	    // Item links
      if (!isItem) {
        // Patient Vouchers
        item.links = [];
        item.links.push(ctx.getLinkCJFormat(router.routesList["patientVouchers"], {patient: p._id}));
        // Patient consultations
        item.links.push(ctx.getLinkCJFormat(router.routesList["patientConsultations"], {patient: p._id}));
        // Patient invoices
        item.links.push(ctx.getLinkCJFormat(router.routesList["patientInvoices"], {patient: p._id}));
      } else {
	      // Patient Link
        var patient_link = ctx.getLinkCJFormat(router.routesList["patient"], {patient: ctx.patient._id});
        patient_link.prompt = ctx.i18n.__("Datos personales"); 
        col.links.push(patient_link);
        // Patient Vouchers
        col.links.push(ctx.getLinkCJFormat(router.routesList["patientVouchers"], {patient: p._id}));
        // Patient consultations
        col.links.push(ctx.getLinkCJFormat(router.routesList["patientConsultations"], {patient: p._id}));
        // Patient invoices
        col.links.push(ctx.getLinkCJFormat(router.routesList["patientInvoices"], {patient: p._id}));
      }

	    return item;
	  });

	  // If no items
	  if (patientList.length == 0) {
	    var item = {};
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = ctx.i18n.__("Mensaje");
	    d.value= ctx.i18n.__("No hay pacientes");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries
    if (!isItem) {
      col.queries = [];
	    col.queries.push(
	      {
		      href: ctx.getLinkCJFormat(router.routesList["patients"]).href,
		      rel: "search",
		      name: "searchpatient",
		      prompt: ctx.i18n.__("Buscar paciente"),
		      data: [
		        {
			        name: "patientData",
			        value: ctx.query.patientData || "",
			        prompt: ctx.i18n.__("Búsqueda por texto"),
              type: 'text'
		        }
		      ]
	      }
	    );
    }
	  // Template
    col.template = {};
	  col.template.data = Patient.getTemplate(ctx.i18n);

	  // Return collection object
    return col;

  }

  // Parameter patient
  router.param('patient', async (id, ctx, next) => {
    ctx.patient = await Patient.findById(id);
    if (!ctx.patient) {
      ctx.throw(404,ctx.i18n.__('Recurso no encontrado'));
    }
    return next();
  });

  // GET Patient list
  router.get(router.routesList["patients"].name, router.routesList["patients"].href, async (ctx, next) => {
    var patients = await Patient.list(ctx.query);
    var col= renderCollectionPatients(ctx, patients);
    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["patient"].name, router.routesList["patient"].href, async (ctx, next) => {
    var patient = ctx.patient;
	  var patients = [];
	  patients.push(patient);
    var col = renderCollectionPatients(ctx, patients, true);
    col.title = ctx.i18n.__('Paciente: ') + ctx.patient.fullName;
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["patient"].name, router.routesList["patient"].href, async (ctx, next) => {
    var doc = await Patient.delById(ctx.patient._id);
    ctx.status = 200;
    return next();

  });

  // PUT item
  router.put(router.routesList["patient"].name, router.routesList["patient"].href, async (ctx, next) => {
    var patientData = CJUtils.parseTemplate(ctx);
    var updatedPatient = await ctx.patient.updatePatient(patientData);
    var patients = [];
    patients.push(updatedPatient);
    var col= renderCollectionPatients(ctx, patients);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["patients"].href, async (ctx,next) => {
    var patientData = CJUtils.parseTemplate(ctx);
    var p = new Patient(patientData);
    var psaved = await p.save();
    ctx.status = 201;
    // Check nextStep
    // If patient was created during consultation creation, return to next step
    if (patientData.nextStep) {
      ctx.set('location', patientData.nextStep + '/' + psaved._id);
    } else {
      ctx.set('location', ctx.getLinkCJFormat(router.routesList["patient"], {patient: psaved._id}).href);
    }
    return next();
  });
}
