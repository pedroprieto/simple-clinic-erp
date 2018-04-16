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
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    promptCJ: "Paciente",
    htmlType: "select"
  }
};


var PatientVoucherSchema = baseschema(patientVoucherSchema);

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
