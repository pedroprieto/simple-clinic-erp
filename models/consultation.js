var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var consultationSchema = {
  date: {
    type: Date,
    promptCJ: "Fecha",
    required: true,
    htmlType: "date"
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    promptCJ: "Paciente",
    htmlType: "select"
  },
  medicalProcedure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalProcedure',
    required: true,
    promptCJ: "Tipo de sesión",
    htmlType: "select"
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    promptCJ: "Médico",
    htmlType: "select"
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    promptCJ: "Factura",
    htmlType: "select"
  },
  associatedVoucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientVoucher',
    promptCJ: "Bono asociado",
    htmlType: "select"
  }
};

var ConsultationSchema = baseschema(consultationSchema);

// Get consultation by id
ConsultationSchema.statics.findById = function (id) {
  return this.findOne({_id: id}).populate(['doctor', 'patient', 'medicalProcedure']).exec();
}

// Delete consultation by id
ConsultationSchema.statics.delById = function (id) {
  return this.findByIdAndRemove(id);
}

// Update consultation by id
ConsultationSchema.statics.updateById = function (id, data) {
  return Consultation.findByIdAndUpdate(id, data);
}

// Convert mongoose object to plain object ready to transform to CJ item data format
// Assume populated object
ConsultationSchema.methods.consultationToCJ = function() {
  var res = {};
  res.date = this.date;
  res.patient = this.patient.fullName;
  res.doctor = this.doctor.fullName;
  res.medicalProcedure = this.medicalProcedure.name;
  return res;
}

// Get consultation list by date range and doctor
ConsultationSchema.statics.findInDateRange = function (dateStart, dateEnd, doctor) {
  return this.find({
    date: {$gte: dateStart, $lte: dateEnd},
    doctor: doctor
  }).populate().exec();
}

// Get consultation list by patient
ConsultationSchema.statics.findByPatient = function (patient) {
  return this.find({
    patient: patient
  });
}

var Consultation = mongoose.model('Consultation', ConsultationSchema);

module.exports = Consultation;
