var mongoose = require('mongoose');

module.exports = function(schema_skel) {
  var schema = mongoose.Schema(schema_skel);


  // Get Prompt from schema definition
  schema.statics.getPrompt = function (prop) {
    return this.schema.obj[prop].promptCJ;
  };

  // Get HTML Type from schema definition
  schema.statics.getType = function (prop) {
    return this.schema.obj[prop].htmlType;
  };


  // Static function to convert plain JS object to Collection + JSON data format
  // Used with output from aggretation framework (plain object)
  // Assumed: object with desired properties + _id
  schema.statics.objToCJ = function (obj) {
    var data = [];
    for (var prop in obj) {
      if (prop === "_id")
        continue;
      var dat = {};
      dat.name = prop;
      dat.value = obj[prop];
      dat.prompt = this.getPrompt(prop);
      dat.type= this.getType(prop);
      data.push(dat);
    }
    return data;
  }

  // Static function to convert data to Collection + JSON format
  // Used by method toObject()
  schema.statics.tx_cj = function (doc, ret, options) {
    var data = [];

    // Delete _id and __v fields
    delete ret._id;
    delete ret.__v;

    for(var p in ret) {
	    if (p.substring(0,1) != '_') {
	      data.push({
          name : p,
          value : ret[p],
          prompt :  doc.schema.obj[p].promptCJ,
          type: doc.schema.obj[p].htmlType
	      });
      }
    }
    return data;
  };

  // Static function to generate template
  schema.statics.template = function (item) {
    var template = {};
    template.data = [];

    for (var p in this.schema.paths) {

	    if (p.substring(0,1) != '_') {
        var v = (typeof item !== 'undefined') ? item[p].value : '';

	      var el = {
		      name : p,
		      value: v,
          prompt :  this.schema.obj[p].promptCJ,
          type: this.schema.obj[p].htmlType
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

  return schema;

}
