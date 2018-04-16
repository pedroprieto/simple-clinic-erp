module.exports = {
  root: {
    name: "root",
    href: "/api",
    rel: "collection",
    prompt: "Raíz"
  },
  patients: {
    name: "patients",
    href: "/api/patients",
    rel: "collection",
    prompt: "Pacientes"
  },
  patient: {
    name: "patient",
    href: "/api/patients/:patient",
    rel: "collection",
    prompt: "Paciente"
  },
  patientVouchers: {
    name: "patientVouchers",
    href: "/api/patients/:patient/vouchers",
    rel: "collection",
    prompt: "Bonos del paciente"
  },
  patientVoucher: {
    name: "patientVoucher",
    href: "/api/patients/:patient/vouchers/:patientVoucher",
    rel: "collection",
    prompt: "Bono del paciente"
  },
  doctors: {
    name: "doctors",
    href: "/api/doctors",
    rel: "collection",
    prompt: "Médicos"
  },
  doctor: {
    name: "doctor",
    href: "/api/doctors/:doctor",
    rel: "collection",
    prompt: "Médico"
  },
  doctorSchedule: {
    name: "doctorSchedule",
    href: "/api/doctors/:doctor/schedule",
    rel: "collection",
    prompt: "Horario del médico"
  },
  doctorScheduleOpeningHour: {
    name: "doctorScheduleOpeningHour",
    href: "/api/doctors/:doctor/schedule/:openingHour",
    rel: "collection",
    prompt: "Franja del horario"
  },
  rooms: {
    name: "rooms",
    href: "/api/rooms",
    rel: "collection",
    prompt: "Salas"
  },
  room: {
    name: "room",
    href: "/api/rooms/:room",
    rel: "collection",
    prompt: "Sala"
  },
  medicalProcedures: {
    name: "medicalProcedures",
    href: "/api/medicalprocedures",
    rel: "collection",
    prompt: "Tipos de sesión"
  },
  medicalProcedure: {
    name: "medicalProcedure",
    href: "/api/medicalprocedures/:medicalprocedure",
    rel: "collection",
    prompt: "Tipo de sesión"
  },
  consultations: {
    name: "consultations",
    href: "/api/doctors/:doctor/consultations",
    rel: "collection",
    prompt: "Consultas"
  },
  consultation: {
    name: "consultation",
    href: "/api/doctors/:doctor/consultations/:consultation",
    rel: "collection",
    prompt: "Consulta"
  },
  consultationVoucherTypes: {
    name: "consultationVoucherTypes",
    href: "/api/consultationVoucherTypes",
    rel: "collection",
    prompt: "Tipos de bonos de consultas"
  },
  consultationVoucherType: {
    name: "consultationVoucherType",
    href: "/api/consultationVoucherTypes/:consultationVoucherType",
    rel: "collection",
    prompt: "Tipo de bono de consultas"
  },
  consultationAssignInvoice: {
    name: "consultationAssignInvoice",
    href: "/api/doctors/:doctor/consultations/:consultation/consultationAssignInvoice",
    rel: "collection",
    prompt: "Asignar factura"
  },
  consultationAssignVoucher: {
    name: "consultationAssignVoucher",
    href: "/api/doctors/:doctor/consultations/:consultation/consultationAssignVoucher",
    rel: "collection",
    prompt: "Asociar a bono"
  },
  //TODO
  invoices: {
    name: "invoices",
    href: "/api/invoices",
    rel: "collection",
    prompt: "Facturas"
  },
  patientConsultations: {
    name: "patientConsultations",
    href: "/api/patients/:patient/consultations",
    rel: "collection",
    prompt: "Lista de consultas del paciente"
  },
  patientInvoices: {
    name: "patient",
    href: "/api/patients/:patient/invoices",
    rel: "collection",
    prompt: "Lista de facturas del paciente"
  }
};
