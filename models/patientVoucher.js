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


// Convert mongoose object to plain object ready to transform to CJ item data format
// Assume populated object
PatientVoucherSchema.methods.patientVoucherToCJ = function() {
  var res = {};
  res.consultationVoucherType = this.consultationVoucherType.name;
  res.numberOfSessions = this.numberOfSessions;
  res.price = this.price;
  res.patient = this.patient.fullName;
  res.remainingConsultations = this.remainingConsultations;
  return res;
}

// Static function to generate template
// I do not use schema.statics.tx_cj because I want to change populated property
PatientVoucherSchema.statics.template_suggest = function (item) {
  var template = {};
  template.data = [];

  for (var p in this.schema.paths) {
	  if (p.substring(0,1) != '_') {
      var v = (typeof item !== 'undefined') ? item[p].value : '';
      var el;
      if (p !== 'consultationVoucherType')
        continue;
	    el = {
		    name : p,
		    value: v,
        text: ((typeof item !== 'undefined') ? item[p].text : ''),
        prompt :  this.schema.obj[p].promptCJ,
        type: this.schema.obj[p].htmlType,
        suggest: {
          related: 'consultationVoucherList',
          value: '_id',
          text: 'name'
        }
	    };

	    if (this.schema.paths[p].isRequired == true)
		    el.required = true;

	    if (typeof this.schema.paths[p].options.match !== 'undefined')
		    el.match = this.schema.paths[p].options.match.toString().replace("/","").replace("/","");
	    
	    template.data.push(el);
    }
  }

  return template;
}


var PatientVoucher = mongoose.model('PatientVoucher', PatientVoucherSchema);

module.exports = PatientVoucher;
