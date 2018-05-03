var baseschema = require('./baseschema');
var mongoose = require('mongoose');
var Moment = require('moment');

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

// Convert mongoose object to plain object ready to transform to CJ item data format
PatientSchema.statics.toCJ = function(i18n, obj) {
  var props = ['givenName', 'familyName', 'taxID', 'telephone', 'address', 'email', 'diagnosis', 'description'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  var birthDate = {
    name: 'birthDate',
    prompt: i18n.__('Fecha de nacimiento'),
    type: 'date',
    value: Moment(obj.birthDate).format('YYYY-MM-DD')
  };
  data.push(birthDate);
  return data;
}

PatientSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['givenName', 'familyName', 'taxID', 'birthDate', 'telephone', 'address', 'email', 'diagnosis', 'description'];
  // Call function defined in baseschema
  return this.propsToCJ(props, i18n, true, obj);
}


// Get patient by id
PatientSchema.statics.findById = function (id) {
  return this.findOne({_id: id});
}

// Delete patient by id
PatientSchema.statics.delById = function (id) {
  return this.findByIdAndRemove(id);
}

// Update patient by id
PatientSchema.methods.updatePatient = function (data) {
  this.set(data);
  return this.save();
}

// Get patients
PatientSchema.statics.list = function (query) {
  var q = {};
	if (typeof query.patientData !== 'undefined') {
	  var re =  new RegExp(query.patientData, "i");
	  q.$or = [];
	  q.$or.push({givenName: re});
	  q.$or.push({familiyName: re});
	  q.$or.push({taxID: re});
	  q.$or.push({telephone: re});
	  q.$or.push({address: re});
	  q.$or.push({email: re});
	}
  return this.find(q, null, {sort: {familyName: 1}});
}

var Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;
