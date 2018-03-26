var mongoose = require('mongoose');

var patientSchema = mongoose.Schema({
  givenName: String,
  familyName: String,
  taxID: String,
  birthDate: Date,
  telephone: String,
  address: String,
  email: String,
  diagnosis: String,
  description: String
});


// Data types
patientSchema.statics.datatypes = {
  givenName: "text",
  familyName: "text",
  taxID: "text",
  birthDate: "date",
  telephone: "tel",
  address: "text",
  email: "email",
  diagnosis: "textarea",
  description: "textarea"
};

// Prompt messages
patientSchema.statics.prompts = {
  givenName: "Nombre",
  familyName: "Apellidos",
  taxID: "NIF",
  birthDate: "Fecha de nacimiento",
  telephone: "Teléfono",
  address: "Dirección",
  email: "Email",
  diagnosis: "Diagnóstico principal",
  description: "Observaciones"
};


// Static function to convert data to Collection + JSON format
// Used by method toObject()
patientSchema.statics.tx_cj = function (doc, ret, options) {
  var data = [];

  // Delete _id and __v fields
  delete ret._id;
  delete ret.__v;

  for(var p in ret) {

	  data.push({
      name : p,
      value : ret[p],
      prompt :  patientSchema.statics.prompts[p],
      type: patientSchema.statics.datatypes[p]
	  });
  }

  return data;

};


var Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
