var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var consultationVoucherTypeSchema = {
  name: {
    type: String,
    promptCJ: "Nombre",
    required: true,
    htmlType: "text"
  },
  medicalProcedure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalProcedure',
    required: true,
    promptCJ: "Tipo de sesión",
    htmlType: "select"
  },
  numberOfConsultations: {
    type: Number,
    promptCJ: "Número de consultas",
    required: true,
    htmlType: "number"
  },
  price: {
    type: Number,
    promptCJ: "Precio",
    required: true,
    htmlType: "number"
  }
};


var ConsultationVoucherTypeSchema = baseschema(consultationVoucherTypeSchema);

// Static function to generate template
// I do not use schema.statics.tx_cj because I want to change populated property
ConsultationVoucherTypeSchema.statics.template_suggest = function (item) {
  var template = {};
  template.data = [];

  for (var p in this.schema.paths) {
	  if (p.substring(0,1) != '_') {
      var v = (typeof item !== 'undefined') ? item[p].value : '';
      var el;
      if (p !== 'medicalProcedure') {
	      el = {
		      name : p,
		      value: v,
          prompt :  this.schema.obj[p].promptCJ,
          type: this.schema.obj[p].htmlType
	      };
      } else {
	      el = {
		      name : p,
		      value: v,
          text: ((typeof item !== 'undefined') ? item[p].text : ''),
          prompt :  this.schema.obj[p].promptCJ,
          type: this.schema.obj[p].htmlType,
          suggest: {
            related: 'medicalProcedurelist',
            value: '_id',
            text: 'name'
          }
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


var ConsultationVoucherType = mongoose.model('ConsultationVoucherType', ConsultationVoucherTypeSchema);

module.exports = ConsultationVoucherType;
