// Appointments resource

var Appointment = require('../models/appointment');
var Moment = require('moment');

module.exports = function(router) {
  // Current week
  router.get('appointments','/appointments', (ctx, next) => {

    var queryweek = ctx.query.isoweekdate;

    var cur_date = Moment();
    var displayed_date = Moment(queryweek);


    if (!displayed_date.isValid()) {
      return ctx.redirect('/appointments');
    }

    var cur_isoweekdate = cur_date.format('GGGG[-W]WW');
    var isoweekdate = displayed_date.format('GGGG[-W]WW');
    var nextisoweekdate = displayed_date.add(1,'w').format('GGGG[-W]WW');
    var previousisoweekdate= displayed_date.subtract(2,'w').format('GGGG[-W]WW');

    var collection = { };

    // Items
    collection.items = [];
    collection.items.push( {name: "isoweekdate", value: isoweekdate, prompt: "ISO Week Date"});

    collection.links = [];
    collection.links.push( {prompt: 'Current week', href: ctx.request.origin + router.url("appointments", {query: {isoweekdate: cur_isoweekdate}}), rel: "current" });
    collection.links.push( {prompt: 'Next week', href: ctx.request.origin + router.url("appointments", {query: {isoweekdate: nextisoweekdate}}), rel: "next" });
    collection.links.push( {prompt: 'Previous week', href: ctx.request.origin + router.url("appointments", {query: {isoweekdate: previousisoweekdate}}), rel: "previous" });
    collection.links.push( {prompt: 'Raíz', href: ctx.request.origin + router.url("root"), rel: "root" });
    collection.links.push( {prompt: 'Pacientes', href: ctx.request.origin + router.url("patients"), rel: "collection" });
    ctx.body = {collection: collection};
    return next();

  });

}
