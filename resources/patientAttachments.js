// PatientAttachments resource
var Patient = require('../models/patient');
var PatientAttachment = require('../models/patientAttachment');
var CJUtils = require('../aux/CJUtils');
var Moment = require('moment');
const fs = require('fs');

module.exports = function(router) {

    async function renderCollectionPatientAttachments(ctx, patientAttachmentList) {
        var col = {};
        col.version = "1.0";

	      // Collection href
        col.href= ctx.getLinkCJFormat(router.routesList["patientAttachments"], {patient: ctx.patient._id}).href;

	      // Collection title
        col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["patientAttachments"], {patient: ctx.patient._id}).prompt);

	      // Collection Links
        col.links = [];
        col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

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
        // Patient Attachments
        col.links.push(ctx.getLinkCJFormat(router.routesList["patientAttachments"], {patient: ctx.patient._id}));
      // Patient Signature
      col.links.push(
        ctx.getLinkCJFormat(router.routesList["patientSignature"], {
          patient: ctx.patient._id,
        }),
      );

	      // Items
	      col.items = patientAttachmentList.map(function(p) {
            var item = {};

	          // Item data
            item.data = PatientAttachment.toCJ(ctx.i18n, p);

	          // Item href
            item.href = ctx.getLinkCJFormat(router.routesList["patientAttachment"], {patient: ctx.patient._id, patientAttachment: p._id}).href;

	          // Item links
            item.links = [];
            // Link to file Data
            item.links.push(ctx.getLinkCJFormat(router.routesList["patientAttachmentFile"], {patient: ctx.patient._id, patientAttachment: p._id}));

	          return item;
	      });

	      // If no items
	      if (patientAttachmentList.length == 0) {
	          var item = {};
            item.readOnly = true;
	          item.data = [];
	          var d = {};
	          d.name = "message";
            d.prompt = ctx.i18n.__("Mensaje");
	          d.value= ctx.i18n.__("No hay archivos para este paciente");
	          item.data.push(d);
	          col.items.push(item);
	      }

	      // Queries

	      // Template
        col.template = {};
        col.template.contentType = "multipart/form-data";
        col.template.type = "post-only";
	      col.template.data = PatientAttachment.getTemplate(ctx.i18n);

	      // Return collection object
        return col;

    }

    // Parameter patientAttachment
    router.param('patientAttachment', async (id, ctx, next) => {
        ctx.patientAttachment = await PatientAttachment.findById(id);
        if (!ctx.patientAttachment) {
            ctx.throw(404,ctx.i18n.__('Recurso no encontrado'));
        }
        return next();
    });

    // GET PatientAttachment list
    router.get(router.routesList["patientAttachments"].name, router.routesList["patientAttachments"].href, async (ctx, next) => {
        var patientAttachments = ctx.patient.attachments;
        var col= await renderCollectionPatientAttachments(ctx, patientAttachments);
        ctx.body = {collection: col};
        return next();

    });

    // GET item
    router.get(router.routesList["patientAttachment"].name, router.routesList["patientAttachment"].href, async (ctx, next) => {
	      var patientAttachments = [];
	      patientAttachments.push(ctx.patientAttachment);
        var col = await renderCollectionPatientAttachments(ctx, patientAttachments);
        ctx.body = {collection: col};
        return next();
    });


    // Get file attachment
    router.get(router.routesList["patientAttachmentFile"].name, router.routesList["patientAttachmentFile"].href, async (ctx, next) => {

        var data = ctx.patientAttachment.fileData;
        ctx.body = data;
        ctx.type = ctx.patientAttachment.type || 'application/octet-stream';
		    ctx.set("Content-Disposition", "attachment; filename=\"" + ctx.patientAttachment.fileName +  "\"");
        return next();
    });

    // DELETE item
    router.delete(router.routesList["patientAttachment"].name, router.routesList["patientAttachment"].href, async (ctx, next) => {
        var doc = await PatientAttachment.delById(ctx.patientAttachment._id);
        ctx.status = 200;
        return next();

    });

    // POST
    router.post(router.routesList["patientAttachments"].href, async (ctx,next) => {
        // Request in multipart/form-data

        // Parameter 'name'
        var attachmentName = ctx.request.body.name;
        if (!attachmentName) {
            ctx.throw(404,ctx.i18n.__('No se encuentra el parámetro name.'));
        }

        // Files
        var files = ctx.request.files.fileData;
        if (!files) {
            ctx.throw(404,ctx.i18n.__('No se encuentra el adjunto fileData.'));
        }

        // Check if there is one or more files
        if (typeof files[Symbol.iterator] === 'function') {
            // Array of files
            for (var f of files) {
                var data = fs.readFileSync(f.path);
                var newAttachment = new PatientAttachment(
                    {
                        name: attachmentName,
                        fileData: data,
                        type: f.type,
                        fileName: f.name

                    });
                var atSaved = await newAttachment.save();
                ctx.patient.attachments.push(atSaved._id);
            }
        } else {
            // Single file
            var data = fs.readFileSync(files.path);
            var newAttachment = new PatientAttachment(
                {
                    name: attachmentName,
                    fileData: data,
                    type: files.type,
                    fileName: files.name

                });
            var atSaved = await newAttachment.save();
            ctx.patient.attachments.push(atSaved._id);
        }

        var psaved = await ctx.patient.save();
        ctx.status = 201;
        ctx.set('location', ctx.getLinkCJFormat(router.routesList["patientAttachments"], {patient: ctx.patient._id}).href);
        return next();
    });


}
