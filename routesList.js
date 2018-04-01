module.exports = {
  root: {
    name: "root",
    href: "/",
    rel: "collection",
    prompt: "Raíz"
  },
  patients: {
    name: "patients",
    href: "/patients",
    rel: "collection",
    prompt: "Pacientes"
  },
  patient: {
    name: "patient",
    href: "/patients/:patient",
    rel: "collection",
    prompt: "Paciente"
  },
  doctors: {
    name: "doctors",
    href: "/doctors",
    rel: "collection",
    prompt: "Médicos"
  },
  doctor: {
    name: "doctor",
    href: "/doctors/:doctor",
    rel: "collection",
    prompt: "Médico"
  },
  doctorSchedule: {
    name: "doctorSchedule",
    href: "/doctors/:doctor/schedule",
    rel: "collection",
    prompt: "Horario del médico"
  },
  doctorScheduleOpeningHour: {
    name: "doctorScheduleOpeningHour",
    href: "/doctors/:doctor/schedule/:openingHour",
    rel: "collection",
    prompt: "Franja del horario"
  },
  rooms: {
    name: "rooms",
    href: "/rooms",
    rel: "collection",
    prompt: "Salas"
  },
  room: {
    name: "room",
    href: "/rooms/:room",
    rel: "collection",
    prompt: "Sala"
  },
};
