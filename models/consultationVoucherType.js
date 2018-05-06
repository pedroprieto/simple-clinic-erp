var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var consultationVoucherTypeSchema = {
  name: {
    type: String,
    promptCJ: "Nombre",
    required: true,
    htmlType: "text"
  },
  medicalProcedure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalProcedure',
    required: true,
    promptCJ: "Tipo de sesión",
    htmlType: "select"
  },
  numberOfConsultations: {
    type: Number,
    promptCJ: "Número de consultas",
    required: true,
    htmlType: "number"
  },
  price: {
    type: Number,
    promptCJ: "Precio",
    required: true,
    htmlType: "number"
  },
  active: {
    type: Boolean,
    default: true,
    promptCJ: "Activo",
    htmlType: "checkbox"
  }
};


var ConsultationVoucherTypeSchema = baseschema(consultationVoucherTypeSchema);

// Convert mongoose object to plain object ready to transform to CJ item data format
ConsultationVoucherTypeSchema.statics.toCJ = function(i18n, obj) {
  var props = ['name', 'numberOfConsultations', 'price'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // Build medicalProcedure
  var medicalProcedure = {
    name: 'medicalProcedure',
    prompt: i18n.__('Tipo de sesión'),
    type: 'select',
    value: obj.medicalProcedure.name,
    text: obj.medicalProcedure.name
  };

  data.push(medicalProcedure);

  return data;
}

ConsultationVoucherTypeSchema.statics.getTemplate = function(i18n, obj) {
  var props = ['name', 'numberOfConsultations', 'price'];
  // Call function defined in baseschema
  var data = this.propsToCJ(props, i18n, false, obj);
  // Build medicalProcedure
  var medicalProcedure = {
    name: 'medicalProcedure',
    prompt: i18n.__('Tipo de sesión'),
    type: 'select',
    value: obj ? obj.medicalProcedure._id : "",
    text: obj ? obj.medicalProcedure.name : "",
    suggest: {
      related: 'medicalProcedurelist',
      value: '_id',
      text: 'name'
    }
  };

  data.push(medicalProcedure);

  return data;
}


// Get consultationVoucher by id
ConsultationVoucherTypeSchema.statics.findById = function (id) {
  return this.findOne({_id: id}).populate('medicalProcedure').exec();
}

// Delete consultationVoucher by id
ConsultationVoucherTypeSchema.statics.delById = function (id) {
  // return this.findByIdAndRemove(id);
  return this.findByIdAndUpdate(id,{ $set: { active: false }});
}

// Update consultationVoucher by id
ConsultationVoucherTypeSchema.methods.updateConsultationVoucherType = function (data) {
  this.set(data);
  return this.save();
}

// Get consultationVouchers
ConsultationVoucherTypeSchema.statics.list = function () {
  return this.find({active: true}).populate('medicalProcedure').exec();
}

var ConsultationVoucherType = mongoose.model('ConsultationVoucherType', ConsultationVoucherTypeSchema);

module.exports = ConsultationVoucherType;
