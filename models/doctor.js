var baseschema = require('./baseschema');
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


var DoctorSchema = baseschema(doctorSchema);

DoctorSchema.virtual('fullName').get(function () {
  return this.givenName + ' ' + this.familyName;
});

var Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;
