export const NAV_PAGES = [
  { name: "NOS", path: "/" },
  { name: "SOMOS", path: "/somos" },
  { name: "AGENDA", path: "/agenda" },
  { name: "COMUNIDAD", path: "/comunidad" },
  {
    name: "EVENTOS",
    children: [
      { name: "PERFORMANCES", path: "/performances" },
      { name: "RESIDENCIAS", path: "/residencias" },
      { name: "FORMACIONES", path: "/formaciones" },
    ],
  },
  { name: "ARCHIVO", path: "/archivo" },
  { name: "NOTAS", path: "/notas" },
  { name: "SALA", path: "/sala" },
  { name: "CONTACTO", path: "/contacto" },
];
