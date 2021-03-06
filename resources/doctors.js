// Doctors resource
var Doctor = require('../models/doctor');
var CJUtils = require('../aux/CJUtils');

module.exports = function(router) {

    function renderCollectionDoctors(ctx, doctorList, isItem) {
        var col = {};
        col.version = "1.0";

	      // Collection href
        col.href= ctx.getLinkCJFormat(router.routesList["doctors"]).href;

	      // Collection title
        col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["doctors"]).prompt);

	      // Collection Links
        col.links = [];
        col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

	      // Items
	      col.items = doctorList.map(function(p) {

            var item = {};
	          // Item data
            item.data = Doctor.toCJ(ctx.i18n, p);

	          // Item href
            item.href = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: p._id}).href;

	          // Item links
            if (!isItem) {
                item.links = [];
                // Doctor schedule link
                item.links.push(ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: p._id}));
                item.links.push(ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: p._id}));
                // Doctor consultations
                // item.links.push(ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: p._id}));
                // Doctor invoices
                item.links.push(ctx.getLinkCJFormat(router.routesList["doctorInvoices"], {doctor: p._id}));
                item.links.push(ctx.getLinkCJFormat(router.routesList["doctorStats"], {doctor: p._id}));
            } else {
                // Put links in col instead
	              // Doctor Link
                col.links.push(ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: p._id}));
                var doctor_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
                doctor_link.prompt = ctx.i18n.__("Datos personales"); 
                col.links.push(doctor_link);
                col.links.push(ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: p._id}));
                // Doctor consultations
                // item.links.push(ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: p._id}));
                // Doctor invoices
                col.links.push(ctx.getLinkCJFormat(router.routesList["doctorInvoices"], {doctor: p._id}));
                col.links.push(ctx.getLinkCJFormat(router.routesList["doctorStats"], {doctor: p._id}));
            }

	          return item;
	      });

	      // If no items
	      if (doctorList.length == 0) {
	          var item = {};
            item.readOnly = true;
	          item.data = [];
	          var d = {};
	          d.name = "message";
            d.prompt = ctx.i18n.__("Mensaje");
	          d.value= ctx.i18n.__("No hay médicos");
	          item.data.push(d);
	          col.items.push(item);
	      }

	      // Queries

	      // Template
        col.template = {};
	      col.template.data = Doctor.getTemplate(ctx.i18n);

	      // Return collection object
        return col;

    }

    // Parameter doctor
    router.param('doctor', async (id, ctx, next) => {
        ctx.doctor = await Doctor.findById(id);
        if (!ctx.doctor) {
            ctx.throw(404,ctx.i18n.__('Recurso no encontrado'));
        }
        return next();
    });

    // GET Doctor list
    router.get(router.routesList["doctors"].name, router.routesList["doctors"].href, async (ctx, next) => {
        var doctors = await Doctor.list();
        var col= renderCollectionDoctors(ctx, doctors);
        ctx.body = {collection: col};
        return next();

    });

    // GET item
    router.get(router.routesList["doctor"].name, router.routesList["doctor"].href, async (ctx, next) => {
        var doctor = ctx.doctor;
	      var doctors = [];
	      doctors.push(doctor);
        var col = renderCollectionDoctors(ctx, doctors, true);
        col.title = ctx.i18n.__('Médico: ') + ctx.doctor.fullName;
        ctx.body = {collection: col};
        return next();
    });

    // DELETE item
    router.delete(router.routesList["doctor"].name, router.routesList["doctor"].href, async (ctx, next) => {
        var doc = await Doctor.delById(ctx.doctor._id);
        ctx.status = 200;
        return next();

    });

    // PUT item
    router.put(router.routesList["doctor"].name, router.routesList["doctor"].href, async (ctx, next) => {
        var doctorData= CJUtils.parseTemplate(ctx);
        var updatedDoctor = await ctx.doctor.updateDoctor(doctorData);
	      var doctors = [];
	      doctors.push(updatedDoctor);
        var col = renderCollectionDoctors(ctx, doctors);
        ctx.body = {collection: col};
        return next();
    });

    // POST
    router.post(router.routesList["doctors"].href, async (ctx,next) => {
        var doctorData= CJUtils.parseTemplate(ctx);
        var p = new Doctor(doctorData);
        var psaved = await p.save();
        ctx.status = 201;
        ctx.set('location', ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: psaved._id}).href);
        return next();
    });
}
