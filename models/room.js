var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var roomSchema = {
  name: {
    type: String,
    promptCJ: "Nombre",
    required: true,
    htmlType: "text"
  },
  capacity: {
    type: Number,
    promptCJ: "Plazas disponibles",
    htmlType: "number"
  }
};


var RoomSchema = baseschema(roomSchema);

// Convert mongoose object to plain object ready to transform to CJ item data format
RoomSchema.statics.toCJ = function(i18n, obj) {
  var props = ['name', 'capacity'];
  // Call function defined in baseschema
  return this.propsToCJ(props, i18n, false, obj);
}

RoomSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['name', 'capacity'];
  // Call function defined in baseschema
  return this.propsToCJ(props, i18n, true, obj);
}


// Get room by id
RoomSchema.statics.findById = function (id) {
  return this.findOne({_id: id});
}

// Delete room by id
RoomSchema.statics.delById = function (id) {
  return this.findByIdAndRemove(id);
}

// Update room by id
RoomSchema.methods.updateRoom = function (data) {
  this.set(data);
  return this.save();
}

// Get rooms
RoomSchema.statics.list = function () {
  return this.find();
}
var Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
