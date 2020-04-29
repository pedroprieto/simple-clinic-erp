var Invoice = require('../models/invoice');
var Moment = require('moment');
var Consultation = require('../models/consultation');

module.exports = function(router) {

    // GET doctor stats
    router.get(router.routesList["doctorStats"].name, router.routesList["doctorStats"].href, async (ctx, next) => {

        var dateStart = ctx.query.dateStart || (new Moment()).startOf('year').format('YYYY-MM-DD');
        var dateEnd = ctx.query.dateEnd || (new Moment()).format('YYYY-MM-DD');


        var col = {};
        col.version = "1.0";

	      // Collection href
        col.href= ctx.getLinkCJFormat(router.routesList["doctorStats"], {doctor: ctx.doctor._id}).href;

	      // Collection title
        col.title = ctx.getLinkCJFormat(router.routesList["doctorStats"], {doctor: ctx.doctor._id}).prompt;

	      // Collection Links
        col.links = [];
        col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));
        col.links.push(ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id}));
        var doctor_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
        doctor_link.prompt = ctx.i18n.__("Datos personales");
        col.links.push(doctor_link);
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctorSchedule"], {doctor: ctx.doctor._id}));
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctorInvoices"], {doctor: ctx.doctor._id}));
        col.title = ctx.i18n.__("Estadísticas de ") + ctx.doctor.fullName;
        col.links.push(ctx.getLinkCJFormat(router.routesList["doctorStats"], {doctor: ctx.doctor._id}));

        // Collection queries
        col.queries = [];
	      col.queries.push(
	          {
                href: ctx.getLinkCJFormat(router.routesList["doctorStats"], {doctor: ctx.doctor._id}).href,
		            rel: "search",
		            name: "searchByPeriod",
		            prompt: ctx.i18n.__("Seleccionar período"),
		            data: [
		                {
			                  name: "dateStart",
			                  value: dateStart,
			                  prompt: ctx.i18n.__("Fecha de inicio"),
                        type: 'date'
		                },
		                {
			                  name: "dateEnd",
			                  value: dateEnd,
			                  prompt: ctx.i18n.__("Fecha de fin"),
                        type: 'date'
		                },
		                {
			                  name: "period",
			                  value: ctx.query.period || "month",
			                  prompt: ctx.i18n.__("Período"),
                        type: 'select',
                        suggest: {
                            related: 'period',
                            value: 'p',
                            text: 'name'
                        }
		                }
		            ]
	          }
	      );

        // Related
        col.related = {};
        col.related.period = [
            {
                p: 'day',
                name: ctx.i18n.__('Día')
            },
            {
                p: 'week',
                name: ctx.i18n.__('Semana')
            },
            {
                p: 'month',
                name: ctx.i18n.__('Mes')
            },
            {
                p: 'quarter',
                name: ctx.i18n.__('Trimestre')
            },
            {
                p: 'year',
                name: ctx.i18n.__('Año')
            }
        ];

	      // Items
        col.items = [];

        // Number of consultations
        var consByPeriod = await Consultation.getConsDoctorNumberByPeriod(ctx.doctor, ctx.query.period, dateStart, dateEnd);
        var numberOfConsultations = {};
        numberOfConsultations.data = [];
        numberOfConsultations.readOnly = true;
        numberOfConsultations.type= "chart line";
        var chartjsData = {
            datasets: [
                {
                    label: ctx.i18n.__("Consultas por período"),
                    data: consByPeriod,
                    fill: false,
                    backgroundColor: "blue",
                    borderColor: "blue",
                    lineTension: 0
                }
            ]
        };
        var data = {
            name: "data",
            value: JSON.stringify(chartjsData),
            prompt: ctx.i18n.__("Datos"),
            type: "text"
        };
        var opts = {
            scales: {
                yAxes: [{
                    type: 'linear',
                    ticks: {
                        min: 0
                    }
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            quarter: 'YYYY-[Q]Q'
                        },
                        unit: ctx.query.period || 'month'
                    }
                }]
            }
        };
        var options = {
            name: "options",
            value: JSON.stringify(opts),
            prompt: ctx.i18n.__("Opciones"),
            type: "text"
        }

        numberOfConsultations.data.push(data);
        numberOfConsultations.data.push(options);

        col.items.push(numberOfConsultations);

        // income stats
        var dat = await Invoice.incomeStats(ctx.doctor, ctx.query.period, dateStart, dateEnd);

        chartjsData = {
            labels: dat.x,
            datasets: [
                {
                    label: ctx.i18n.__("Ingresos brutos (Neto + IVA - IRPF)"),
                    fill: false,
                    backgroundColor: "blue",
                    borderColor: "blue",
                    lineTension: 0,
                    data: dat.gross
                },
                {
                    label: "Ingresos netos (base imponible)",
                    label: ctx.i18n.__("Ingresos netos (base imponible)"),
                    fill: false,
                    borderColor: "green",
                    backgroundColor: "green",
                    lineTension: 0,
                    data: dat.net
                },
                {
                    label: ctx.i18n.__("IVA"),
                    fill: false,
                    borderColor: "orange",
                    backgroundColor: "orange",
                    lineTension: 0,
                    data: dat.tax
                },
                {
                    label: ctx.i18n.__("IRPF"),
                    fill: false,
                    borderColor: "red",
                    backgroundColor: "red",
                    lineTension: 0,
                    data: dat.incomeTax
                },
                {
                    label: "Beneficios (Neto - IRPF)",
                    label: ctx.i18n.__("Beneficios (Neto - IRPF)"),
                    fill: false,
                    borderColor: "yellow",
                    backgroundColor: "yellow",
                    lineTension: 0,
                    data: dat.benefits
                },
            ]
        }

        var it2 = {};
        it2.data = [];
        it2.readOnly = true;
        it2.type= "chart line";

        data = {
            name: "data",
            value: JSON.stringify(chartjsData),
            prompt: ctx.i18n.__("Datos"),
            type: "text"
        }
        opts = {
            title: {
                display: true,
                text: ctx.i18n.__("Ingresos (facturación) ")
            },
            scales: {
                yAxes: [{
                    type: 'linear',
                    ticks: {
                        min: 0
                    }
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: ctx.query.period || 'month'
                    }
                }]
            }
        }
        options = {
            name: "options",
            value: JSON.stringify(opts),
            prompt: ctx.i18n.__("Opciones"),
            type: "text"
        }

        it2.data.push(data);
        it2.data.push(options);
        col.items.push(it2);

        ctx.body = {collection: col};
        return next();

    });
}
