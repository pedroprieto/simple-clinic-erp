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

// Convert mongoose object to plain object ready to transform to CJ item data format
// Assume populated object
DoctorSchema.methods.toCJ = function() {
  var res = {};
  res.givenName = this.givenName;
  res.familyName = this.familyName;
  res.taxID = this.taxID;
  res.telephone = this.telephone;
  res.address = this.address;
  res.email = this.email;
  return res;
}

// Generate template from baseschema function
DoctorSchema.statics.getTemplate = function(item) {
  return this.template(item);
}


// Get doctor by id
DoctorSchema.statics.findById = function (id) {
  return this.findOne({_id: id}).populate('_schedule').exec();
}

// Delete consultation by id
DoctorSchema.statics.delById = function (id) {
  return this.findByIdAndRemove(id);
}

// Update consultation by id
DoctorSchema.methods.updateDoctor = function (data) {
  this.set(data);
  return this.save();
}

// Get doctors
DoctorSchema.statics.list = function () {
  return this.find().populate('_schedule').exec();
}

var Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;
