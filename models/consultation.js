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
  }
};

var ConsultationSchema = baseschema(consultationSchema);

// Static function to generate template
// I do not use schema.statics.tx_cj because I want to change populated property
ConsultationSchema.statics.template_suggest = function (item) {
  var template = {};
  template.data = [];

  for (var p in this.schema.paths) {
	  if (p.substring(0,1) != '_') {
      var v = (typeof item !== 'undefined') ? item[p].value : '';
      var el;
      if (p === 'doctor') {
	      el = {
		      name : p,
		      value: v,
          text: ((typeof item !== 'undefined') ? item[p].text : ''),
          prompt :  this.schema.obj[p].promptCJ,
          type: this.schema.obj[p].htmlType,
          suggest: {
            related: 'doctors',
            value: '_id',
            text: 'fullName'
          }
	      };
      } else if (p === 'patient') {
	      el = {
		      name : p,
		      value: v,
          text: ((typeof item !== 'undefined') ? item[p].text : ''),
          prompt :  this.schema.obj[p].promptCJ,
          type: this.schema.obj[p].htmlType,
          suggest: {
            related: 'patients',
            value: '_id',
            text: 'fullName'
          }
	      };
      } else if (p === 'medicalProcedure') {
	      el = {
		      name : p,
		      value: v,
          text: ((typeof item !== 'undefined') ? item[p].text : ''),
          prompt :  this.schema.obj[p].promptCJ,
          type: this.schema.obj[p].htmlType,
          suggest: {
            related: 'medicalProcedures',
            value: '_id',
            text: 'name'
          }
	      };
      } else {
	      el = {
		      name : p,
		      value: v,
          prompt :  this.schema.obj[p].promptCJ,
          type: this.schema.obj[p].htmlType
	      };
      }

	    if (this.schema.paths[p].isRequired == true)
		    el.required = true;

	    if (typeof this.schema.paths[p].options.match !== 'undefined')
		    el.match = this.schema.paths[p].options.match.toString().replace("/","").replace("/","");
	    
	    template.data.push(el);
    }
  }

  return template;
}

var Consultation = mongoose.model('Consultation', ConsultationSchema);

module.exports = Consultation;
