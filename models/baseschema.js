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

  // Get required field from schema definition
  schema.statics.isRequired = function (prop) {
    return this.schema.obj[prop].required;
  };

  // Get required field from schema definition
  schema.statics.matchField = function (prop) {
    if (typeof this.schema.obj[prop].match !== 'undefined') {
		  return this.schema.obj[prop].match.toString().replace("/","").replace("/","");
    }

    return null;
  };

  // Function to convert mongoose object to CJ data. Only converts properties in 'props' array
  // obj: object to be converted
  // props: array of item props to convert
  // isTemplate: include (or not) 'required' and 'match' fields for template
  // i18n: locales
  schema.statics.propsToCJ = function (props, i18n, isTemplate, obj) {
    return props.map(
      function(prop) {
        var dat = {};
        dat.name = prop;
        dat.value = obj ? obj[prop] : "";
        dat.prompt = i18n ? i18n.__(this.getPrompt(prop)) : this.getPrompt(prop);
        dat.type= this.getType(prop);

        if (isTemplate) {
          if (prop == 'price')
            dat.step = "0.01";
          if (this.isRequired(prop))
		        dat.required = true;

          if (this.matchField(prop))
            dat.match = this.matchField(prop);
        }
        return dat;
      }.bind(this)
    );
  };

  return schema;
}
