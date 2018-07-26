var Invoice = require('../models/invoice');

module.exports = function(router) {

  function renderCollectionInvoices(ctx, invoiceList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["invoices"]).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["invoices"]).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

	  // Items
	  col.items = invoiceList.map(function(p) {
      var item = {};

	    // Item data
      item.data = p.invoiceToCJ();
      item.readOnly = true;

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["invoice"], {invoice: p._id}).href;

	    // Item links
      // TODO: patient and doctor associated
      item.links = [];
      // if (!p.invoice && !p.assignedVoucher) {
      //   item.links.push(ctx.getLinkCJFormat(router.routesList["invoiceAssignInvoice"], {invoice: p._id}));
      //   item.links.push(ctx.getLinkCJFormat(router.routesList["invoiceAssignVoucher"], {invoice: p._id}));
      // }
      item.links.push(ctx.getLinkCJFormat(router.routesList["invoiceHTML"], {invoice: p._id}));

	    return item;
	  });

	  // If no items
	  if (invoiceList.length == 0) {
	    var item = {};
      item.readOnly = true;
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay facturas");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Return collection object
    return col;

  }

  // Parameter invoice
  router.param('invoice', async (id, ctx, next) => {
    ctx.invoice = await Invoice.findOne({_id: id}).populate(['seller', 'customer', 'orderItems']).exec();
    return next();
  });


  // GET invoice list
  router.get(router.routesList["invoices"].name, router.routesList["invoices"].href, async (ctx, next) => {

    // Get invoices
    var invoices = await Invoice.list();
    var col= await renderCollectionInvoices(ctx, invoices);

    ctx.body = {collection: col};
    return next();

  });

  // GET patient invoices
  router.get(router.routesList["patientInvoices"].name, router.routesList["patientInvoices"].href, async (ctx, next) => {

    // Get invoices
    var invoices = await Invoice.listByCustomer(ctx.patient._id);
    var col= await renderCollectionInvoices(ctx, invoices);

	  // Patient Link
    var patient_link = ctx.getLinkCJFormat(router.routesList["patient"], {patient: ctx.patient._id});
    patient_link.prompt = ctx.i18n.__("Datos personales"); 
    col.links.push(patient_link);
    // Patient Vouchers
    col.links.push(ctx.getLinkCJFormat(router.routesList["patientVouchers"], {patient: ctx.patient._id}));
    // Patient consultations
    col.links.push(ctx.getLinkCJFormat(router.routesList["patientConsultations"], {patient: ctx.patient._id}));
    // Patient invoices
    col.links.push(ctx.getLinkCJFormat(router.routesList["patientInvoices"], {patient: ctx.patient._id}));
    // Patient attachments
    col.links.push(ctx.getLinkCJFormat(router.routesList["patientAttachments"], {patient: ctx.patient._id}));


    // Patientlink
    // var patient_link = ctx.getLinkCJFormat(router.routesList["patient"], {patient: ctx.patient._id});
    // patient_link.prompt = ctx.patient.fullName;
    // patient_link.rel = "collection up";
    // col.links.push(patient_link);

    ctx.body = {collection: col};
    return next();

  });

  // GET doctor invoices
  router.get(router.routesList["doctorInvoices"].name, router.routesList["doctorInvoices"].href, async (ctx, next) => {

    // Get invoices
    var invoices = await Invoice.listBySeller(ctx.doctor._id);
    var col= await renderCollectionInvoices(ctx, invoices);

    // Doctor link
    // var doctor_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
    // doctor_link.prompt = ctx.doctor.fullName;
    // doctor_link.rel = "collection up";
    // col.links.push(doctor_link);
    col.links.push(ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id}));
    var doctor_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
    doctor_link.prompt = ctx.i18n.__("Datos personales"); 
    col.links.push(doctor_link);
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: ctx.doctor._id}));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctorInvoices"], {doctor: ctx.doctor._id}));
    col.title = ctx.i18n.__("Facturas de ") + ctx.doctor.fullName;

    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["invoice"].name, router.routesList["invoice"].href, async (ctx, next) => {
	  var invoices = [];
	  invoices.push(ctx.invoice);
    var col = await renderCollectionInvoices(ctx, invoices);
    ctx.body = {collection: col};
    return next();
  });

  // Invoice HTML
  router.get(router.routesList["invoiceHTML"].name, router.routesList["invoiceHTML"].href, async (ctx, next) => {

    await ctx.render('invoice', {
      invoice: ctx.invoice
    });

  });

}
