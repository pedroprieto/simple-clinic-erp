var basemodel = require('./basemodel');
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


var Room = basemodel('Room', roomSchema);

module.exports = Room;
