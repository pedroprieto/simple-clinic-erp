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
    rel: "collection secondary",
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
    rel: "collection secondary",
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
    rel: "collection secondary",
    prompt: "Salas"
  },
  room: {
    name: "room",
    href: "/api/rooms/:room",
    rel: "collection secondary",
    prompt: "Sala"
  },
  medicalProcedures: {
    name: "medicalProcedures",
    href: "/api/medicalprocedures",
    rel: "collection secondary",
    prompt: "Tipos de sesión"
  },
  medicalProcedure: {
    name: "medicalProcedure",
    href: "/api/medicalprocedures/:medicalprocedure",
    rel: "collection secondary",
    prompt: "Tipo de sesión"
  },
  consultations: {
    name: "consultations",
    href: "/api/doctors/:doctor/consultations",
    rel: "collection",
    prompt: "Consultas"
  },
  consultations_select_patient: {
    name: "consultations_select_patient",
    href: "/api/doctors/:doctor/consultations/select/:date",
    rel: "collection",
    prompt: "Seleccionar paciente"
  },
  consultations_select_medProc: {
    name: "consultations_select_medProc",
    href: "/api/doctors/:doctor/consultations/select/:date/:patient",
    rel: "collection",
    prompt: "Seleccionar"
  },
  consultations_create: {
    name: "consultations_create",
    href: "/api/doctors/:doctor/consultations/select/:date/:patient/:medicalprocedure",
    rel: "collection",
    prompt: "Crear consulta"
  },
  consultation: {
    name: "consultation",
    href: "/api/doctors/:doctor/consultations/item/:consultation",
    rel: "collection",
    prompt: "Consulta"
  },
  consultationVoucherTypes: {
    name: "consultationVoucherTypes",
    href: "/api/consultationVoucherTypes",
    rel: "collection secondary",
    prompt: "Tipos de bonos de consultas"
  },
  consultationVoucherType: {
    name: "consultationVoucherType",
    href: "/api/consultationVoucherTypes/:consultationVoucherType",
    rel: "collection secondary",
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
  },
  config: {
    name: "config",
    href: "/api/config",
    rel: "collection",
    prompt: "Configuración"
  }
};
