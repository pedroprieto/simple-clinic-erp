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

    // Get selected ISO week in query. Current week if invalid or no query
    var queryweek = ctx.query.isoweekdate;

    var cur_date = Moment();
    var displayed_date = Moment(queryweek);

    if (!displayed_date.isValid()) {
      return ctx.redirect(router.routesList["agenda"].href);
    }

    var cur_isoweekdate = cur_date.format('GGGG[-W]WW');
    var isoweekdate = displayed_date.clone().format('GGGG[-W]WW');
    var nextisoweekdate = displayed_date.clone().add(1,'w').format('GGGG[-W]WW');
    var previousisoweekdate= displayed_date.clone().subtract(1,'w').format('GGGG[-W]WW');


    var availableHours = [];
    var limitHours = ctx.doctor._schedule.reduce(function(prev, sch) {
      var ret = prev;
      if (sch.opens < prev.from) {
        ret.from= sch.opens;
      }
      if (sch.closes > prev.to) {
        ret.to = sch.closes;
      }
      return ret;
    },{from: '23:59', to: '00:00'});

    var init_hour = Moment('2018-01-01 ' + limitHours.from);
    while (init_hour.format('HH:mm') < limitHours.to) {
      availableHours.push(init_hour.format('HH:mm'));
      init_hour.add(30, 'm');
    }


    // col.meta.currentWeek = isoweekdate;
    var listOfDays = [];

    var begin = displayed_date.clone().startOf('isoWeek').isoWeekday();
    var wend = displayed_date.clone().endOf('isoWeek').isoWeekday();
    var d = displayed_date.clone().startOf('isoWeek');
    while (begin <= wend) {
      listOfDays.push(d.format('YYYY-MM-DD'));
      d.add(1, 'days');
      begin++;
    }

    // Get consultations from specified week
    var consultations = await Consultation.findInDateRange(displayed_date.clone().startOf('isoWeek').toDate(), displayed_date.clone().endOf('isoWeek').toDate(), ctx.doctor._id);

    // List of days and hours

    var dayHour = listOfDays.reduce(function(res, el) {
      var wholeDate = availableHours.map(function(h) {
        var wD = this + 'T' + h;
        var it = {data: [], links:[], group: el, hour: h};
        var cs = consultations.filter(function(c) {
          return Moment(c.date).isSame(wD);
        }).map(function(e) {
          var con = ctx.getLinkCJFormat(router.routesList["consultation"], {consultation: e._id});
          con.prompt = e.patient.fullName;
          return con;
        });
        it.links = cs;
        // Template
        // TODO: only if within doctor schedule
        if (checkIfWithinDoctorSchedule(wD, ctx.doctor._schedule)) {
          var l = ctx.getLinkCJFormat(router.routesList["consultations_select_patient"], {doctor: ctx.doctor._id, date: wD});
          l.rel += " template";
          it.links.push(l);
        }
        return it;
      }, el);

      return res.concat(wholeDate);
    }.bind(this), []);;

    // var col= await renderCollectionConsultations(ctx, consultations);
    var col = {};
    col.version = "1.0";


    // Col type
    col.type = "agenda";

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["config"]));

    // col items
    col.items = dayHour;

    // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id}).href;

	  // Collection title
    // col.title = ctx.i18n.__(ctx.getLinkCJFormat(router.routesList["agenda"], {doctor: ctx.doctor._id}).prompt);
    col.title = ctx.i18n.__("Agenda de ") + ctx.doctor.fullName;

    // Doctor link
    var back_link = ctx.getLinkCJFormat(router.routesList["doctor"], {doctor: ctx.doctor._id});
    back_link.prompt = ctx.doctor.fullName;
    back_link.rel = "collection up";
    col.links.push(back_link);

    // Pagination links
    var l;
    l = ctx.getLinkCJFormat(router.routesList["agenda"],{doctor: ctx.doctor._id},{query: {isoweekdate: cur_isoweekdate}});
    l.rel = 'current';
    l.prompt = ctx.i18n.__('Semana actual');
    col.links.push(l);

    l = ctx.getLinkCJFormat(router.routesList["agenda"],{doctor: ctx.doctor._id},{query: {isoweekdate: previousisoweekdate}});
    l.rel = 'prev';
    l.prompt = ctx.i18n.__('Semana anterior');
    col.links.push(l);

    l = ctx.getLinkCJFormat(router.routesList["agenda"],{doctor: ctx.doctor._id},{query: {isoweekdate: nextisoweekdate}});
    l.rel = 'next';
    l.prompt = ctx.i18n.__('Semana siguiente');
    col.links.push(l);

	  // Template
    // col.template = {};
	  // col.template.data = Consultation.getTemplate(ctx.i18n);

    // Meta

    col.meta = {};
    col.meta.listOfDays = listOfDays;
    col.meta.availableHours = availableHours;

    ctx.body = {collection: col};
    return next();

  });

};
