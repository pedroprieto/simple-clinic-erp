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
  },
  active: {
    type: Boolean,
    default: true,
    promptCJ: "Activo",
    htmlType: "checkbox"
  }
};


var MedicalProcedureSchema = baseschema(medicalProcedureSchema);

// Convert mongoose object to plain object ready to transform to CJ item data format
MedicalProcedureSchema.statics.toCJ = function(i18n, obj) {
  var props = ['name', 'duration', 'price'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // Build room
  var room = {
    name: 'room',
    prompt: i18n.__('Sala'),
    type: 'select',
    text: obj.room.name,
    value: obj.room.name
  };

  data.push(room);

  return data;
}

MedicalProcedureSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['name', 'duration', 'price'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // Build room
  var room = {
    name: 'room',
    prompt: i18n.__('Sala'),
    type: 'select',
    value: obj ? obj.room._id : "",
    text: obj ? obj.room.name : "",
    suggest: {
      related: 'roomlist',
      value: '_id',
      text: 'name'
    }
  };

  data.push(room);

  return data;
}


// Get medicalProcedure by id
MedicalProcedureSchema.statics.findById = function (id) {
  return this.findOne({_id: id}).populate('room').exec();
}

// Delete medicalProcedure by id
MedicalProcedureSchema.statics.delById = function (id) {
  // return this.findByIdAndRemove(id);
  return this.findByIdAndUpdate(id,{ $set: { active: false }});
}

// Update medicalProcedure by id
MedicalProcedureSchema.methods.updateMedicalProcedure = function (data) {
  this.set(data);
  return this.save();
}

// Get medicalProcedures
MedicalProcedureSchema.statics.list = function () {
  return this.find({active: true}).populate('room').exec();
}

var MedicalProcedure = mongoose.model('MedicalProcedure', MedicalProcedureSchema);

module.exports = MedicalProcedure;
