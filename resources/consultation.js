// Consultations resource
var Consultation = require('../models/consultation');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');
var MedicalProcedure = require('../models/medicalprocedure');
var Moment = require('moment');

module.exports = function(router) {

  async function renderCollectionConsultations(ctx, consultationList) {
    var col = {};
    col.version = "1.0";

	  // Collection href
    col.href= ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: ctx.doctor._id}).href;

	  // Collection title
    col.title = ctx.getLinkCJFormat(router.routesList["consultations"], {doctor: ctx.doctor._id}).prompt;

	  // Collection Links
    col.links = [];
    col.links.push(ctx.getLinkCJFormat(router.routesList["root"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["patients"]));
    col.links.push(ctx.getLinkCJFormat(router.routesList["doctors"]));

	  // Items
	  // Item data
	  col.items = consultationList.map(function(p) {
      var pobj = p.toObject();
      var item = {};
      item.data = [];

      for (var d in pobj) {
	      if (d.substring(0,1) != '_') {
          var dat = {};
          dat.name = d;
          dat.prompt = p.schema.obj[d].promptCJ;
          dat.type = p.schema.obj[d].htmlType;
          // TODO: required
          if (d==='patient') {
            dat.value = pobj[d]._id;
            dat.text= p[d].fullName;
          } else if (d==='doctor') {
            dat.value = pobj[d]._id;
            dat.text = p[d].fullName;
          } else if (d==='medicalProcedure') {
            dat.value = pobj[d]._id;
            dat.text= pobj[d].name;
          } else {
            dat.value = pobj[d];
          }
          item.data.push(dat);
        }
      }

	    // Item href
      item.href = ctx.getLinkCJFormat(router.routesList["consultation"], {doctor: ctx.doctor._id, consultation: p._id}).href;

	    // Item links

	    return item;
	  });

	  // If no items
	  if (consultationList.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "message";
      d.prompt = "Mensaje";
	    d.value= ctx.i18n.__("No hay consultas");
	    item.data.push(d);
	    col.items.push(item);
	  }

	  // Queries

	  // Template
	  col.template = Consultation.template_suggest();


    // Related
    col.related = {};

    // var doctor_list = await Doctor.find();
    // col.related.doctors = doctor_list.map(function (doc) {
    //   var d = {};
    //   d._id = doc._id;
    //   d.fullName = doc.fullName;
    //   return d;
    // });

    var patient_list = await Patient.find();
    col.related.patients= patient_list.map(function (doc) {
      var d = {};
      d._id = doc._id;
      d.fullName = doc.fullName;
      return d;
    });

    var medicalProcedure_list = await MedicalProcedure.find();
    col.related.medicalProcedures = medicalProcedure_list.map(function (doc) {
      var d = {};
      d._id = doc._id;
      d.name = doc.name;
      return d;
    });

	  // Return collection object
    return col;

  }

  // Parameter consultation
  router.param('consultation', (id, ctx, next) => {
    ctx.consultation = id;
    return next();
  });

  // GET Consultation list
  router.get(router.routesList["consultations"].name, router.routesList["consultations"].href, async (ctx, next) => {

    // Get selected ISO week in query. Current week if invalid or no query
    var queryweek = ctx.query.isoweekdate;

    var cur_date = Moment();
    var displayed_date = Moment(queryweek);


    if (!displayed_date.isValid()) {
      // TODO: fix link
      return ctx.redirect('/consultations');
    }

    var cur_isoweekdate = cur_date.format('GGGG[-W]WW');
    var isoweekdate = displayed_date.clone().format('GGGG[-W]WW');
    var nextisoweekdate = displayed_date.clone().add(1,'w').format('GGGG[-W]WW');
    var previousisoweekdate= displayed_date.clone().subtract(1,'w').format('GGGG[-W]WW');

    // Get consultations from specified week
    var consultations = await Consultation.find({date: { $gt: displayed_date.clone().startOf('isoWeek'), $lt: displayed_date.clone().endOf('isoWeek') }}).populate(['patient', 'doctor', 'medicalProcedure']).exec();
    var col= await renderCollectionConsultations(ctx, consultations);

    col.links.push(ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: cur_isoweekdate}} ));
    col.links.push(ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: nextisoweekdate}} ));
    col.links.push(ctx.getLinkCJFormat(router.routesList["consultations"],{doctor: ctx.doctor._id},{query: {isoweekdate: previousisoweekdate}} ));

    ctx.body = {collection: col};
    return next();

  });

  // GET item
  router.get(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
    var consultation = await Consultation.findOne({_id: ctx.consultation}).populate(['patient', 'doctor', 'medicalProcedure']).exec();
	  var consultations = [];
	  consultations.push(consultation);
    var col = await renderCollectionConsultations(ctx, consultations);
    ctx.body = {collection: col};
    return next();
  });

  // DELETE item
  router.delete(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
    var doc = await Consultation.findByIdAndRemove(ctx.consultation);
    var consultations = await Consultation.find();
    var col= await renderCollectionConsultations(ctx, consultations);
    ctx.body = {collection: col};
    return next();

  });

  // Aux function for PUT and POST
  async function parseTemplate(ctx) {
	  if ((typeof ctx.request.body.template === 'undefined') || (typeof ctx.request.body.template.data === 'undefined') || (!Array.isArray(ctx.request.body.template.data))) {
      var consultations = await Consultation.find();
      var col= await renderCollectionConsultations(ctx, consultations);
      ctx.body = {collection: col};
      ctx.throw(400, 'Los datos no están en formato CJ');
	  }

    var data = ctx.request.body.template.data;

    // Convert CJ format to JS object
	  var consultationData = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	  } , {});

    return consultationData;
  }

  // PUT item
  router.put(router.routesList["consultation"].name, router.routesList["consultation"].href, async (ctx, next) => {
    var consultationData = await parseTemplate(ctx);
    await Consultation.findByIdAndUpdate(ctx.consultation, consultationData);
    var consultations = await Consultation.find();
    var col= await renderCollectionConsultations(ctx, consultations);
    ctx.body = {collection: col};
    return next();
  });

  // POST
  router.post(router.routesList["consultations"].href, async (ctx,next) => {
    var consultationData = await parseTemplate(ctx);
    var associated_doctor = await Doctor.findById(ctx.doctor._id);
    var associated_patient = await Patient.findById(consultationData.patient);
    var associated_medicalProcedure= await MedicalProcedure.findById(consultationData.medicalProcedure);
    //TODO
    if (typeof associated_doctor === 'undefined') {
      ctx.throw('400', 'Error');
    } else {
      consultationData.doctor = associated_doctor._id;
      consultationData.patient = associated_patient._id;
      consultationData.medicalProcedure = associated_medicalProcedure._id;
      var p = new Consultation(consultationData);
      var psaved = await p.save();
      var consultations = await Consultation.find().populate(['patient', 'doctor', 'medicalProcedure']).exec();
      var col= await renderCollectionConsultations(ctx, consultations);
      ctx.body = {collection: col};
      ctx.status = 201;
      ctx.set('location', ctx.getLinkCJFormat(router.routesList["consultation"], {doctor: ctx.doctor._id, consultation: psaved._id}).href);
      return next();
    }
  });
}
