var basemodel = require('./basemodel');
var mongoose = require('mongoose');

var doctorSchema = {
  givenName: {
    type: String,
    promptCJ: "Nombre",
    required: true,
    htmlType: "text"
  },
  familyName: {
    type: String,
    promptCJ: "Apellidos",
    htmlType: "text"
  },
  taxID: {
    type: String,
    promptCJ: "NIF",
    htmlType: "text"
  },
  telephone: {
    type: String,
    promptCJ: "Teléfono",
    htmlType: "tel"
  },
  address: {
    type: String,
    promptCJ: "Dirección",
    htmlType: "text"
  },
  email: {
    type: String,
    promptCJ: "Email",
    htmlType: "email"
  },
  _schedule: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OpeningHour',
      promptCJ: "Horario"

    }
  ]
};


var Doctor = basemodel('Doctor', doctorSchema);

module.exports = Doctor;
