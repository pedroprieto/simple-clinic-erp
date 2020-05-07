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
  var start = {
    name: 'start',
    prompt: i18n.__('Comienzo'),
    type: 'datetime',
    value: obj.date,
    text: obj.dateLocalized
  };
  var end = {
    name: 'end',
    prompt: i18n.__('Fin'),
    type: 'datetime',
    value: Moment(obj.date).add(Moment.duration(obj.medicalProcedure.duration)),
    text: obj.dateLocalized
  };
  var medicalProcedure = {
    name: 'medicalProcedure',
    prompt: i18n.__('Tipo de sesión'),
    type: 'select',
    value: obj.medicalProcedure._id,
    text: obj.medicalProcedure.name
  };
  var patient = {
    name: 'patient',
    prompt: i18n.__('Paciente'),
    type: 'select',
    value: obj.patient._id,
    text: obj.patient.fullName
  };
  var title = {
    name: 'title',
    prompt: i18n.__('Paciente'),
    type: 'select',
    value: `${obj.patient.fullName} ${obj.invoice ? "(" + i18n.__("Facturada") + ")" : ""}${obj.associatedVoucher? "(" + i18n.__("Bono") + ")" : ""}`,
    text: obj.patient.fullName
  };
  var doctor = {
    name: 'doctor',
    prompt: i18n.__('Médico'),
    type: 'select',
    value: obj.doctor._id,
    text: obj.doctor.fullName
  };
  var kind = {
    name: 'kind',
    prompt: i18n.__('Tipo'),
    type: 'hidden',
    value: (obj.invoice ? 'invoice' : '') + ' ' + (obj.associatedVoucher ? 'voucher' : ''),
    text: (obj.invoice ? 'invoice' : '') + ' ' + (obj.associatedVoucher ? 'voucher' : '')
  };

  data.push(date);
  data.push(medicalProcedure);
  data.push(patient);
  data.push(doctor);
  data.push(title);
  data.push(kind);
  data.push(start);
  data.push(end);

  return data;
}

ConsultationSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['diagnosis', 'description'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, true, obj);
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
  return this.findOne({_id: id}).populate(['doctor', 'patient', 'medicalProcedure', 'associatedVoucher']).exec();
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
  const start = new Date(dateStart).setHours(0,0,0,0);
  const end = new Date(dateEnd).setHours(23,59,59,9990);
  return this.find({
    date: {$gte: start, $lte: end},
    doctor: doctor
  }).
    sort({date: -1}).
    populate(['doctor', 'patient', 'medicalProcedure', 'associatedVoucher']).exec();
}

// Get consultation list by patient
ConsultationSchema.statics.findByPatient = function (patient) {
  return this.find({
    patient: patient
  }).
    sort({date: -1}).
    populate(['doctor', 'patient', 'medicalProcedure', 'associatedVoucher']).exec();
}

ConsultationSchema.statics.getConsDoctorNumberByPeriod = function(doctor, period, dateStart, dateEnd) {
    var periodString;
    switch (period) {
    case 'day':
        periodString = "%Y-%m-%d";
        break;
    case 'week':
        periodString = "%G-W%V";
        break;
    case 'quarter':
        // TODO
        periodString = "%Y-%m";
        break;
    case 'year':
        periodString = "%Y";
        break;
    case 'month':
    default:
        periodString = "%Y-%m";
        break;
    };

    return this.aggregate(
        [
            {
                $match : {
                    $and: [
                        {doctor: { $eq: doctor._id }},
                        {date: {$gte: new Date(dateStart), $lte: new Date(dateEnd)}}
                    ]
                }
            },
            {
                $project:{
                    _id: 0,
                    period: {$dateToString: {format: periodString, date: "$date"}}
                }
            },
            {
                $group :
                {
                    _id: "$period",
                    y: { $sum: 1 }
                }
            },
            {
                $sort : { _id: 1  }
            },
            {
                $project:{
                    _id: 0,
                    x: "$_id",
                    y: 1
                }
            },
        ]
    )
}

var Consultation = mongoose.model('Consultation', ConsultationSchema);

module.exports = Consultation;
