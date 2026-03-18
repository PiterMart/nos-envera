import EventTypePage from "../../components/EventTypePage";
import { PERFORMANCE_TYPES } from "../../lib/eventUtils";

export default function Perfos() {
  return (
    <EventTypePage
      title="Perfos"
      subtext="Las exhibiciones y performance son instancias abiertas al público, que permiten el despliegue de obras de artistas contemporánexs, en compromiso con una escena viva, en diálogo con la comunidad y fortalecen la circulación de nuevas prácticas."
      eventTypeFilter={PERFORMANCE_TYPES[0]}
      emptyStateText="No hay perfos registradas todavía."
      defaultImageAlt="Presentación"
      basePath="/evento"
    />
  );
}
