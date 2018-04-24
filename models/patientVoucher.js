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
  }
};


var PatientVoucherSchema = baseschema(patientVoucherSchema);

PatientVoucherSchema.pre('save', function(next) {
  this.remainingConsultations = this.numberOfSessions - this._associatedConsultations.length;
  next();
});


// Convert mongoose object to plain object ready to transform to CJ item data format
PatientVoucherSchema.statics.toCJ = function(i18n, obj) {
  var props = ['numberOfSessions', 'price', 'remainingConsultations'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // Build consultation Voucher Type
  var type = {
    name: 'consultationVoucherType',
    prompt: i18n.__('Tipo de sesión'),
    type: 'select',
    value: obj.consultationVoucherType.name
  };
  // Build patient name
  var patient = {
    name: 'patient',
    prompt: i18n.__('Paciente'),
    type: 'select',
    value: obj.patient.fullName
  };

  data.push(type);
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
  return PatientVoucher.find().populate(['patient','consultationVoucherType']).exec();
}

PatientVoucherSchema.statics.findById = function (id) {
  return PatientVoucher.findOne({_id: id}).populate(['patient','consultationVoucherType']).exec();
}

PatientVoucherSchema.statics.updateById = function (id, data) {
  return PatientVoucher.findByIdAndUpdate(id, data);
}

PatientVoucherSchema.methods.addConsultation = function (consultation) {
  this._associatedConsultations.push(consultation);
  return this.save();
}

PatientVoucherSchema.statics.findByPatient = function (patient) {
  return this.find({
    patient: patient
  }).populate(['patient','consultationVoucherType']).exec();
}

// Find patient vouchers with remaining sessions available
PatientVoucherSchema.statics.findAvailableByPatient = function (patient) {
  return this.find({
    patient: patient,
    remainingConsultations: {$gt: 0}
  }).populate('consultationVoucherType').exec();
}



var PatientVoucher = mongoose.model('PatientVoucher', PatientVoucherSchema);

module.exports = PatientVoucher;
