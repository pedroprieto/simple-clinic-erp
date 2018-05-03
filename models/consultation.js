var baseschema = require('./baseschema');
var mongoose = require('mongoose');
var Moment = require('moment');

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

// Convert mongoose object to plain object ready to transform to CJ item data format
ConsultationSchema.statics.toCJ = function(i18n, obj) {
  // var props = ['date'];
  // Call function defined in baseschema
  // var data = this.propsToCJ(props, i18n, false, obj);
  var data = [];
  var date = {
    name: 'date',
    prompt: i18n.__('Fecha'),
    type: 'date',
    value: Moment(obj.date).format('llll')
  };
  var medicalProcedure = {
    name: 'medicalProcedure',
    prompt: i18n.__('Tipo de sesión'),
    type: 'select',
    value: obj.medicalProcedure.name
  };
  var patient = {
    name: 'patient',
    prompt: i18n.__('Paciente'),
    type: 'select',
    value: obj.patient.fullName
  };
  var doctor = {
    name: 'doctor',
    prompt: i18n.__('Médico'),
    type: 'select',
    value: obj.doctor.fullName
  };

  data.push(date);
  data.push(medicalProcedure);
  data.push(patient);
  data.push(doctor);

  return data;
}

ConsultationSchema.statics.getTemplate = function(i18n, obj) {
  var data = [];
  data.push(
    {
      prompt: i18n.__("Seleccionar fecha"),
      name: "date",
      value: "",
      type: 'date',
      required: true
    }
  );

  return data;
}

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
