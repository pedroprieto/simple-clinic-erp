// Patients resource
var Patient = require('../models/patient');

module.exports = function(router) {
  router.get('patients','/patients', (ctx, next) => {

    var patientlist = Patient.find().then(function(patients) {
      var collection = { };
      //TODO
      collection.items = patients;
      collection.links = [];
      collection.links.push( {prompt: 'Raíz', href: ctx.request.origin + router.url("root"), rel: "root" });
      collection.links.push( {prompt: 'Pacientes', href: ctx.request.origin + router.url("patients"), rel: "collection" });
      ctx.body = {collection: collection};
      return next();
    });

    return patientlist;

  });

  router.post('/patients', (ctx,next) => {
    var data = ctx.request.body;
    console.log(data);
    var p = new Patient(data);
    return p.save().then(function(r) {
      return Patient.find();
    }).then(function(plist) {
      ctx.body = 'Hello Post' + plist;
      return next();
    });
  });
}
