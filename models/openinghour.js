var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var openingHourSchema = {
  dayOfWeek: {
    type: String,
    enum: ['Lunes', 'Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    promptCJ: "Día de la semana",
    required: true,
    htmlType: "select"
  },
  opens: {
    type: String,
    promptCJ: "Desde",
    match: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
    required: true,
    htmlType: "time"
  },
  closes: {
    type: String,
    promptCJ: "Hasta",
    match: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
    required: true,
    htmlType: "time"
  }};

var OpeningHourSchema = baseschema(openingHourSchema);

// Static function to generate template
// I do not use schema.statics.tx_cj because I want to change populated property
OpeningHourSchema.statics.template_suggest = function (item) {
  var template = {};
  template.data = [];

  for (var p in this.schema.paths) {
	  if (p.substring(0,1) != '_') {
      var v = (typeof item !== 'undefined') ? item[p].value : '';
      var el;
      if (p !== 'dayOfWeek') {
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
            related: 'dayOfWeekList',
            value: 'name',
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

var OpeningHour = mongoose.model('OpeningHour', OpeningHourSchema);

module.exports = OpeningHour;
