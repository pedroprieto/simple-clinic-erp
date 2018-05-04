var baseschema = require('./baseschema');
var mongoose = require('mongoose');
var Moment = require('moment');

var openingHourSchema = {
  dayOfWeek: {
    type: String,
    enum: [1,2,3,4,5,6,7],
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

// Convert mongoose object to plain object ready to transform to CJ item data format
OpeningHourSchema.statics.toCJ = function(i18n, obj) {
  var props = ['opens', 'closes'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // Build dayOfWeek
  var dayOfWeek = {
    name: 'dayOfWeek',
    prompt: i18n.__('Día de la semana'),
    type: 'select',
    value: parseInt(obj.dayOfWeek),
    text: Moment().isoWeekday(parseInt(obj.dayOfWeek)).format('dddd')
  };

  data.push(dayOfWeek);
  return data;
}

OpeningHourSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['opens', 'closes'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // Build dayOfWeek
  var dayOfWeek = {
    name: 'dayOfWeek',
    prompt: i18n.__('Día de la semana'),
    type: 'select',
    value: obj ? obj.dayOfWeek : null,
    text: obj ? Moment().isoWeekday(parseInt(obj.dayOfWeek)).format('dddd') : "",
    suggest: {
      related: 'dayOfWeek',
      value: 'value',
      text: 'text'
    }
  };

  data.push(dayOfWeek);

  return data;
}


// Get openingHour by id
OpeningHourSchema.statics.findById = function (id) {
  return this.findOne({_id: id});
}

// Delete openingHour by id
OpeningHourSchema.statics.delById = function (id) {
  return this.findByIdAndRemove(id);
}

// Update openingHour by id
OpeningHourSchema.methods.updateOpeningHour = function (data) {
  this.set(data);
  return this.save();
}

var OpeningHour = mongoose.model('OpeningHour', OpeningHourSchema);

module.exports = OpeningHour;
