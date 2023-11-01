// PatientVouchers resource
var CJUtils = require("../aux/CJUtils");

module.exports = function (router) {
  router.get(
    router.routesList["patientSignature"].name,
    router.routesList["patientSignature"].href,
    async (ctx, next) => {
      var col = {};
      col.version = "1.0";

      // Collection href
      col.href = ctx.getLinkCJFormat(router.routesList["patientSignature"], {
        patient: ctx.patient._id,
      }).href;

      // Collection title
      col.title = ctx.i18n.__(
        ctx.getLinkCJFormat(router.routesList["patientSignature"], {
          patient: ctx.patient._id,
        }).prompt,
      );

      col.type = "template";

      // Collection Links
      col.links = [];
      // Patient Link
      var patient_link = ctx.getLinkCJFormat(router.routesList["patient"], {
        patient: ctx.patient._id,
      });
      patient_link.prompt = ctx.i18n.__("Datos personales");
      col.links.push(patient_link);
      // Patient Vouchers
      col.links.push(
        ctx.getLinkCJFormat(router.routesList["patientVouchers"], {
          patient: ctx.patient._id,
        }),
      );
      // Patient consultations
      col.links.push(
        ctx.getLinkCJFormat(router.routesList["patientConsultations"], {
          patient: ctx.patient._id,
        }),
      );
      // Patient invoices
      col.links.push(
        ctx.getLinkCJFormat(router.routesList["patientInvoices"], {
          patient: ctx.patient._id,
        }),
      );
      // Patient Attachments
      col.links.push(
        ctx.getLinkCJFormat(router.routesList["patientAttachments"], {
          patient: ctx.patient._id,
        }),
      );
      // Patient Signature
      col.links.push(
        ctx.getLinkCJFormat(router.routesList["patientSignature"], {
          patient: ctx.patient._id,
        }),
      );
      col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
      col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
      col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

      // Collection template
      col.template = { data: [] };
      col.template.data.push({
        prompt: ctx.i18n.__("Firma autorización"),
        name: "signature",
        value: ctx.patient.signature,
        type: "signature",
      });

      ctx.body = { collection: col };
      return next();
    },
  );

  router.post(router.routesList["patientSignature"].href, async (ctx, next) => {
    var data = CJUtils.parseTemplate(ctx);
    try {
      ctx.patient.signature = data.signature;
      await ctx.patient.save();
      ctx.status = 201;
      ctx.set(
        "location",
        ctx.getLinkCJFormat(router.routesList["patient"], {
          patient: ctx.patient.id,
        }).href,
      );
      return next();
    } catch (e) {
      console.log(e);
    }
  });
};
