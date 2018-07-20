var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var patientVoucherSchema = {
  consultationVoucherType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsultationVoucherType',
    required: true,
    promptCJ: "Tipo de sesión",
    htmlType: "select"
  },
  name: {
    type: String,
    promptCJ: "Nombre",
    required: true,
    htmlType: "text"
  },
  numberOfSessions: {
    type: Number,
    required: true,
    promptCJ: "Número de sesiones",
    htmlType: "number"
  },
  price: {
    type: Number,
    required: true,
    promptCJ: "Precio",
    htmlType: "number"
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    promptCJ: "Paciente",
    htmlType: "select"
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    promptCJ: "Factura",
    htmlType: "select"
  },
  _associatedConsultations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    promptCJ: "Consultas asociadas",
    htmlType: "text"
  }],
  remainingConsultations: {
    type: Number,
    promptCJ: "Sesiones restantes",
    htmltype: "number"
  },
  active: {
    type: Boolean,
    default: true,
    promptCJ: "Activo",
    htmlType: "checkbox"
  }
};


var PatientVoucherSchema = baseschema(patientVoucherSchema);

PatientVoucherSchema.pre('save', function(next) {
  this.remainingConsultations = this.numberOfSessions - this._associatedConsultations.length;
  next();
});


// Convert mongoose object to plain object ready to transform to CJ item data format
PatientVoucherSchema.statics.toCJ = function(i18n, obj) {
  var props = ['name', 'numberOfSessions', 'price', 'remainingConsultations'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // // Build consultation Voucher Type
  // var type = {
  //   name: 'consultationVoucherType',
  //   prompt: i18n.__('Tipo de sesión'),
  //   type: 'select',
  //   value: obj.consultationVoucherType.name
  // };
  // Build patient name
  var patient = {
    name: 'patient',
    prompt: i18n.__('Paciente'),
    type: 'select',
    value: obj.patient.fullName,
    text: obj.patient.fullName
  };

  // data.push(type);
  data.push(patient);

  return data;
}

PatientVoucherSchema.statics.getTemplate = function(i18n, obj) {
  var data = [];
  // Build consultation Voucher Type
  var type = {
    name: 'consultationVoucherType',
    prompt: i18n.__('Tipo de sesión'),
    type: 'select',
    value: obj ? obj.consultationVoucherType._id : "",
    text: obj ? obj.consultationVoucherType.name : "",
    suggest: {
      related: 'consultationVoucherList',
      value: '_id',
      text: 'name'
    }
  };

  data.push(type);

  return data;
}

PatientVoucherSchema.statics.list = function () {
  return PatientVoucher.find({active: true}).populate(['patient','consultationVoucherType','consultationVoucherType.medicalProcedure']).exec();
}

PatientVoucherSchema.statics.findById = function (id) {
  return PatientVoucher.findOne({_id: id}).populate(['patient','consultationVoucherType']).exec();
}

PatientVoucherSchema.statics.updateById = function (id, data) {
  return PatientVoucher.findByIdAndUpdate(id, data);
}

PatientVoucherSchema.statics.delById = function (id) {
  // return this.findByIdAndRemove(id);
  return this.findByIdAndUpdate(id,{ $set: { active: false }});
}

PatientVoucherSchema.methods.addConsultation = function (consultation) {
  this._associatedConsultations.push(consultation);
  return this.save();
}

PatientVoucherSchema.methods.removeConsultation = function (consultation) {
  this._associatedConsultations.pop(consultation);
  return this.save();
}

PatientVoucherSchema.statics.findByPatient = function (patient) {
  return this.find({
    patient: patient,
    active: true
  }).populate(['patient','consultationVoucherType','consultationVoucherType.medicalProcedure']).exec();
}

// Find patient vouchers with remaining sessions available
PatientVoucherSchema.statics.findAvailableByPatient = function (patient) {
  return this.find({
    patient: patient,
    active: true,
    remainingConsultations: {$gt: 0}
  }).populate('consultationVoucherType').exec();
}



var PatientVoucher = mongoose.model('PatientVoucher', PatientVoucherSchema);

module.exports = PatientVoucher;
