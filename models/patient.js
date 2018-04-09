var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var patientSchema = {
  givenName: {
    type: String,
    promptCJ: "Nombre",
    htmlType: "text"
  },
  familyName: {
    type: String,
    promptCJ: "Apellidos",
    htmlType: "text"
  },
  taxID: {
    type: String,
    promptCJ: "NIF",
    htmlType: "text"
  },
  birthDate: {
    type: Date,
    promptCJ: "Fecha de nacimiento",
    htmlType: "date"
  },
  telephone: {
    type: String,
    promptCJ: "Teléfono",
    htmlType: "tel"
  },
  address: {
    type: String,
    promptCJ: "Dirección",
    htmlType: "text"
  },
  email: {
    type: String,
    promptCJ: "Email",
    htmlType: "email"
  },
  diagnosis: {
    type: String,
    promptCJ: "Diagnóstico principal",
    htmlType: "textarea"
  },
  description: {
    type: String,
    promptCJ: "Observaciones",
    htmlType: "textarea"
  }
};


var PatientSchema = baseschema(patientSchema);
PatientSchema.virtual('fullName').get(function () {
  return this.givenName + ' ' + this.familyName;
});

var Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;
