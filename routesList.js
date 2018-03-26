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
  }
};
