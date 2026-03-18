import EventTypePage from "../../components/EventTypePage";
import { RESIDENCY_TYPE } from "../../lib/eventUtils";

export default function Residencias() {
  return (
    <EventTypePage
      title="Residencias"
      subtext="Con un enfoque que privilegia la investigación y el proceso artístico, Nos en Vera ofrece residencias de creación en las que cada artista define sus propias premisas de trabajo. Incentivamos a lxs artistas residentes a realizar aperturas públicas de sus procesos creativos. Estas instancias habilitan espacios de prueba y experimentación, en diálogo con la comunidad y con quienes se acercan al espacio."
      eventTypeFilter={RESIDENCY_TYPE}
      emptyStateText="No hay residencias registradas todavía."
      defaultImageAlt="Residencia"
      basePath="/evento"
    />
  );
}
