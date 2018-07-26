var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var patientAttachmentSchema = {
  name: {
    type: String,
    promptCJ: "Nombre",
    required: true,
    htmlType: "text"
  },
  type: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileData: {
    type: Buffer,
    promptCJ: "Archivo adjunto",
    required: true,
    htmlType: "file"
  }
};


var PatientAttachmentSchema = baseschema(patientAttachmentSchema);

// Convert mongoose object to plain object ready to transform to CJ item data format
PatientAttachmentSchema.statics.toCJ = function(i18n, obj) {
  var props = ['name'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  return data;
}

PatientAttachmentSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['name', 'fileData'];
  // Call function defined in baseschema
  return this.propsToCJ(props, i18n, true, obj);
}

// Get patientAttachment by id
PatientAttachmentSchema.statics.findById = function (id) {
  return this.findOne({_id: id});
}

// Delete patientAttachment by id
PatientAttachmentSchema.statics.delById = function (id) {
  return this.findByIdAndRemove(id);
}

// Update patientAttachment by id
PatientAttachmentSchema.methods.updatePatientAttachment = function (data) {
  this.set(data);
  return this.save();
}
var PatientAttachment = mongoose.model('PatientAttachment', PatientAttachmentSchema);

module.exports = PatientAttachment;
