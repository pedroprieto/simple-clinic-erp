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
  diagnosis: {
    type: String,
    promptCJ: "Diagnóstico",
    htmlType: "textarea"
  },
  description: {
    type: String,
    promptCJ: "Observaciones y tratamiento",
    htmlType: "textarea"
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

ConsultationSchema.virtual('dateLocalized').get(function () {
  return Moment(this.date).format('llll');
});

// Convert mongoose object to plain object ready to transform to CJ item data format
ConsultationSchema.statics.toCJ = function(i18n, obj) {
  var props = ['diagnosis', 'description'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  var date = {
    name: 'date',
    prompt: i18n.__('Fecha'),
    type: 'datetime',
    value: obj.date,
    text: obj.dateLocalized
  };
  var medicalProcedure = {
    name: 'medicalProcedure',
    prompt: i18n.__('Tipo de sesión'),
    type: 'select',
    value: obj.medicalProcedure.name,
    text: obj.medicalProcedure.name
  };
  var patient = {
    name: 'patient',
    prompt: i18n.__('Paciente'),
    type: 'select',
    value: obj.patient.fullName,
    text: obj.patient.fullName
  };
  var doctor = {
    name: 'doctor',
    prompt: i18n.__('Médico'),
    type: 'select',
    value: obj.doctor.fullName,
    text: obj.doctor.fullName
  };

  data.push(date);
  data.push(medicalProcedure);
  data.push(patient);
  data.push(doctor);

  return data;
}

ConsultationSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['diagnosis', 'description'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // data.push(
  //   {
  //     prompt: i18n.__("Seleccionar fecha"),
  //     name: "date",
  //     value: "",
  //     type: 'date',
  //     required: true
  //   }
  // );

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
  }).
    sort({date: -1}).
    populate(['doctor', 'patient', 'medicalProcedure']).exec();
}

// Get consultation list by patient
ConsultationSchema.statics.findByPatient = function (patient) {
  return this.find({
    patient: patient
  }).
    sort({date: -1}).
    populate(['doctor', 'patient', 'medicalProcedure']).exec();
}

var Consultation = mongoose.model('Consultation', ConsultationSchema);

module.exports = Consultation;
