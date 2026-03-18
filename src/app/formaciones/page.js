import EventTypePage from "../../components/EventTypePage";
import { TRAINING_TYPES } from "../../lib/eventUtils";

export default function Formacion() {
  return (
    <EventTypePage
      title="Formación"
      subtext="En su área de formación, Nos en Vera es sede de seminarios, talleres, workshops, laboratorios y prácticas colectivas abiertas, diseñadas para ampliar el acceso a experiencias artísticas innovadoras y fortalecer redes de intercambio."
      eventTypeFilter={TRAINING_TYPES[0]}
      emptyStateText="No hay formaciones registradas todavía."
      defaultImageAlt="Formación"
      basePath="/evento"
    />
  );
}
