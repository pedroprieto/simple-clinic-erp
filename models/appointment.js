var mongoose = require('mongoose');

var appointmentSchema = mongoose.Schema({
  title: String,
  dateStart: Date,
  dateEnd: Date
});

var Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
