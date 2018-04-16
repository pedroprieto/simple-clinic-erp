module.exports = {
  patient_test_template_1: {
	  template: {
	    data: [
		    {name: "givenName", value: "Patient name 1"},
		    {name: "familyName", value: "Family Name patient 1"},
		    {name: "taxID", value: "123456789k"},
		    {name: "birthDate", value: "2018-01-24"},
		    {name: "telephone", value: "666666666"},
		    {name: "address", value: "Test address st"},
		    {name: "email", value: "patient1@email.com"},
		    {name: "diagnosis", value: "Main diagnosis description."},
		    {name: "description", value: "Patient 1 additional notes"}
	    ]
	  }
  },
  doctor_test_template_1: {
	  template: {
	    data: [
		    {name: "givenName", value: "Doctor name 1"},
		    {name: "familyName", value: "Family Name doctor 1"},
		    {name: "taxID", value: "123456789k"},
		    {name: "telephone", value: "666666666"},
		    {name: "address", value: "Test address st"},
		    {name: "email", value: "doctor@email.com"}
	    ]
	  }
  },
  doctor_opening_hour_1: {
    template: {
      data: [
        {name: "dayOfWeek", value: "Lunes"},
        {name: "opens", value: "10:00"},
        {name: "closes", value: "14:00"}
      ]
    }
  },
  doctor_opening_hour_2: {
    template: {
      data: [
        {name: "dayOfWeek", value: "Martes"},
        {name: "opens", value: "11:00"},
        {name: "closes", value: "14:00"}
      ]
    }
  },
  room_test_template_1: {
    template: {
      data: [
        {name: "name", value: "Room number 1"},
        {name: "capacity", value: 1}
      ]
    }
  },
  medicalProcedure_test_template_1: {
    template: {
      data: [
        {name: "name", value: "Medical Procedure #1"},
        {name: "duration", value: "00:45"},
        {name: "price", value: 25}
      ]
    }
  },
  consultation_test_template_1: {
    template: {
      data: [
        {name: "date", value: "2018-04-09"}
      ]
    }
  },
  consultationVoucherType_test_template_1: {
    template: {
      data: [
        {name: "name", value: "Voucher #1"},
        {name: "numberOfConsultations", value: 5},
        {name: "price", value: 45}
      ]
    }
  },
}
