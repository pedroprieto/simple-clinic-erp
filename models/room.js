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
var Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
