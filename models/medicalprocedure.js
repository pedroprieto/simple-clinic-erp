var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var medicalProcedureSchema = {
  name: {
    type: String,
    promptCJ: "Nombre",
    required: true,
    htmlType: "text"
  },
  duration: {
    type: String,
    promptCJ: "Duración",
    match: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
    required: true,
    htmlType: "time"
  },
  price: {
    type: Number,
    promptCJ: "Precio",
    required: true,
    htmlType: "number"
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    promptCJ: "Sala",
    htmlType: "select"
  }
};


var MedicalProcedureSchema = baseschema(medicalProcedureSchema);

// Static function to generate template
// I do not use schema.statics.tx_cj because I want to change populated property
MedicalProcedureSchema.statics.template_suggest = function (item) {
  var template = {};
  template.data = [];

  for (var p in this.schema.paths) {
	  if (p.substring(0,1) != '_') {
      var v = (typeof item !== 'undefined') ? item[p].value : '';
      var el;
      if (p !== 'room') {
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
            related: 'roomlist',
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


var MedicalProcedure = mongoose.model('MedicalProcedure', MedicalProcedureSchema);

module.exports = MedicalProcedure;
