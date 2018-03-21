// Patients resource
var Patient = require('../models/patient');

module.exports = function(router) {
  router.get('patients','/patients', (ctx, next) => {

    var patientlist = Patient.find().then(function(patients) {
      ctx.body = 'Hello Other' + patients ;
    });

    return patientlist;

    // ctx.router available
  });

  router.post('/patients', (ctx,next) => {
    var data = ctx.request.body;
    console.log(data);
    var p = new Patient(data);
    return p.save().then(function(r) {
      return Patient.find();
    }).then(function(plist) {
      ctx.body = 'Hello Post' + plist;
    });
  });
}
