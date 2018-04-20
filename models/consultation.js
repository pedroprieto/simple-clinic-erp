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
  invoiced: {
    type: Boolean,
    promptCJ: "Facturada",
    required: true,
    htmlType: "checkbox",
    default: false
  },
  invoiceDate: {
    type: Date,
    promptCJ: "Fecha de factura",
    htmlType: "date"
  },
  invoiceNumber: {
    type: Number,
    promptCJ: "Número de factura",
    htmlType: "number"
  },
  _associatedVoucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientVoucher',
    promptCJ: "Bono asociado",
    htmlType: "select"
  }
};

var ConsultationSchema = baseschema(consultationSchema);


// Delete consultation by id
ConsultationSchema.statics.delById = async function (id) {
  return await this.findByIdAndRemove(id);
}

// Update consultation by id
ConsultationSchema.statics.updateById = async function (id, data) {
  return await Consultation.findByIdAndUpdate(id, data);
}

// Get populated consultation by id
ConsultationSchema.statics.findById = async function (id) {
  var res = await this.aggregate([
	  {
	    $match: {
        _id: mongoose.Types.ObjectId(id)
	    }
    },
    {
      $lookup: {
        from: "patients",
        localField: "patient",
        foreignField: "_id",
        as: "patients"
      }
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctors"
      }
    },
    {
      $lookup: {
        from: "medicalprocedures",
        localField: "medicalProcedure",
        foreignField: "_id",
        as: "medicalProcedures"
      }
    },
    { "$project":
      {
        "date": 1,
        "patient": { "$arrayElemAt": [ "$patients", 0 ] },
        "doctor": { "$arrayElemAt": [ "$doctors", 0 ] },
        "medicalProcedure": { "$arrayElemAt": [ "$medicalProcedures", 0 ] }
      }
    },
    { "$project":
      {
        "date": 1,
        "patient": {$concat: ['$patient.givenName', ' ', '$patient.familyName']},
        "doctor": {$concat: ['$doctor.givenName', ' ', '$doctor.familyName']},
        "medicalProcedure": '$medicalProcedure.name'
      }
    }
  ]);

  return res[0];
}

// Get consultation list by date range
ConsultationSchema.statics.findInDateRange = async function (dateStart, dateEnd, doctor) {
  var res = await this.aggregate([
	  {
	    $match: {
		    doctor: doctor,
		    date: { $gte: dateStart, $lte: dateEnd }
	    }
    },
    {
      $lookup: {
        from: "patients",
        localField: "patient",
        foreignField: "_id",
        as: "patients"
      }
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctors"
      }
    },
    {
      $lookup: {
        from: "medicalprocedures",
        localField: "medicalProcedure",
        foreignField: "_id",
        as: "medicalProcedures"
      }
    },
    { "$project":
      {
        "date": 1,
        "patient": { "$arrayElemAt": [ "$patients", 0 ] },
        "doctor": { "$arrayElemAt": [ "$doctors", 0 ] },
        "medicalProcedure": { "$arrayElemAt": [ "$medicalProcedures", 0 ] }
      }
    },
    { "$project":
      {
        "date": 1,
        "patient": {$concat: ['$patient.givenName', ' ', '$patient.familyName']},
        "doctor": {$concat: ['$doctor.givenName', ' ', '$doctor.familyName']},
        "medicalProcedure": '$medicalProcedure.name'
      }
    }
  ]);
  return res;
}

var Consultation = mongoose.model('Consultation', ConsultationSchema);

module.exports = Consultation;
