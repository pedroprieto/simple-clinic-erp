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
  ],
  active: {
    type: Boolean,
    default: true,
    promptCJ: "Activo",
    htmlType: "checkbox"
  }
};


var DoctorSchema = baseschema(doctorSchema);

DoctorSchema.virtual('fullName').get(function () {
  return this.givenName + ' ' + this.familyName;
});

// Convert mongoose object to plain object ready to transform to CJ item data format
DoctorSchema.statics.toCJ = function(i18n, obj) {
  var props = ['givenName', 'familyName', 'taxID', 'telephone', 'address', 'email'];
  // Call function defined in baseschema
  return this.propsToCJ(props, i18n, false, obj);
}

DoctorSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['givenName', 'familyName', 'taxID', 'telephone', 'address', 'email'];
  // Call function defined in baseschema
  return this.propsToCJ(props, i18n, true, obj);
}

// Get doctor by id
DoctorSchema.statics.findById = function (id) {
  return this.findOne({_id: id}).populate({path: '_schedule', options: {sort: {dayOfWeek: 1, opens: 1}}}).exec();
}

// Delete doctor by id
DoctorSchema.statics.delById = function (id) {
  // return this.findByIdAndRemove(id);
  return this.findByIdAndUpdate(id,{ $set: { active: false }});
}

// Update doctor by id
DoctorSchema.methods.updateDoctor = function (data) {
  this.set(data);
  return this.save();
}

// Get doctors
DoctorSchema.statics.list = function () {
  return this.find({active: true}).populate('_schedule').exec();
}

var Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;
