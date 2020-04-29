// Consultations resource
var Consultation = require('../models/consultation');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');
var Room = require('../models/room');
var MedicalProcedure = require('../models/medicalprocedure');
var Moment = require('moment');
var PatientVoucher = require('../models/patientVoucher');
var Invoice = require('../models/invoice');
var CJUtils = require('../aux/CJUtils');
module.exports = function(router) {
    function checkIfWithinDoctorSchedule(date, docSch) {
        var mD = Moment(date);

        for (var a of docSch) {
            var day = a.dayOfWeek;

            if (mD.isoWeekday() == day) {
                if ((mD.format('HH:mm') >= a.opens) && (mD.format('HH:mm') < a.closes))
                    return true;
            }
        }
        return false;
    };

    // GET Doctor agenda
    router.get(router.routesList["agenda"].name, router.routesList["agenda"].href, async (ctx, next) => {

        var momentBegin, momentEnd;

        if (ctx.query.dateBegin) {
            momentBegin = Moment(ctx.query.dateBegin);
        } else {
            momentBegin = Moment().startOf('isoWeek');
        }

        if (ctx.query.dateEnd) {
            momentEnd = Moment(ctx.query.dateEnd);
        } else {
            momentEnd = Moment().endOf('isoWeek');
        }

        // Redirect if incorrect dates provided in query
        if ((!momentBegin.isValid()) || (!momentEnd.isValid()))
            return ctx.redirect(ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id}).href);

        var availableHours = ctx.doctor._schedule.map(sch => {
            return  {
                group: 'availableHour',
                data: [
                    {name: 'daysOfWeek', prompt: "Día de la semana", value: sch.dayOfWeek},
                    {name: 'startTime', prompt: "Hora de apertura", value: sch.opens},
                    {name: 'endTime', prompt: "Hora de cierre", value: sch.closes},
                ]
            }
            availableHours.push(availableHour);
        })


        // Get consultations from selected period
        // For each consultation, generate item in group 'consultations'
        var consultations = await Consultation.findInDateRange(momentBegin.toDate(), momentEnd.toDate(), ctx.doctor._id);

        var cons_items = consultations.map(c => {
            var item = {};
            if (c.invoice || c.associatedVoucher)
                item.readOnly = true;
            item.href = ctx.getLinkCJFormat(router.routesList["consultation"], {consultation: c._id}).href;
            item.data = Consultation.toCJ(ctx.i18n, c);
            item.group = 'consultation';
            return item;
        })

        // Collection + JSON response
        var col = {};
        col.version = "1.0";

        // Col type
        col.type = "agenda";

        // Queries: change view (day, week, month)
        col.queries = [];
	      col.queries.push(
	          {
		            href: ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id}).href,
		            rel: "search specific",
		            name: "searchdate",
		            prompt: ctx.i18n.__("Buscar fechas"),
		            data: [
		                {
			                  name: "dateBegin",
			                  value: "",
			                  prompt: ctx.i18n.__("Fecha de inicio"),
                        type: 'date'
		                },
		                {
			                  name: "dateEnd",
			                  value: "",
			                  prompt: ctx.i18n.__("Fecha de fin"),
                        type: 'date'
		                },
		                {
			                  name: "view",
			                  value: "",
			                  prompt: ctx.i18n.__("Vista"),
                        type: 'string'
		                }
		            ]
	          },
	          {
		            href: ctx.getLinkCJFormat(router.routesList["consultations_select_patient"], {doctor: ctx.doctor._id}).href,
		            rel: "searchpatient specific",
		            name: "searchpatient",
		            prompt: ctx.i18n.__("Seleccionar paciente"),
		            data: [
		                {
			                  name: "date",
			                  value: "",
			                  prompt: ctx.i18n.__("Fecha de consulta"),
                        type: 'date'
		                }
		            ]
	          }
	      );


	      // Collection Links
        col.links = [];
        col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

        // col items
        col.items = [];
        col.items = col.items.concat(cons_items).concat(availableHours);

        // Collection href
        col.href= ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id}).href;

	      // Collection title
        col.title = ctx.i18n.__("Agenda de ") + ctx.doctor.fullName;

	      // Doctor Link
        col.links.push(ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id}));
        var doctor_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
        doctor_link.prompt = ctx.i18n.__("Datos personales");
        col.links.push(doctor_link);
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: ctx.doctor._id}));
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctorInvoices"], {doctor: ctx.doctor._id}));
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctorStats"], {doctor: ctx.doctor._id}));

	      // Template
        col.template = {};
        col.template.type = 'edit-only';
        col.template.data = [
            {
                name: 'date',
                value: '',
			          prompt: ctx.i18n.__("Fecha de consulta"),
                type: 'date',
                required: true
            }
        ]

        ctx.body = {collection: col};
        return next();

    });

};
