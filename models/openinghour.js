var basemodel = require('./basemodel');

var openingHourSchema = {
  dayOfWeek: {
    type: String,
    enum: ['Lunes', 'Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    promptCJ: "Día de la semana",
    required: true,
    htmlType: "select"
  },
  opens: {
    type: String,
    promptCJ: "Desde",
    match: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
    required: true,
    htmlType: "time"
  },
  closes: {
    type: String,
    promptCJ: "Hasta",
    match: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
    required: true,
    htmlType: "time"
  }};


var OpeningHour = basemodel('OpeningHour', openingHourSchema);

module.exports = OpeningHour;