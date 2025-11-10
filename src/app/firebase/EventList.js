"use client";
import { useEffect, useMemo, useState } from "react";
import { firestore } from "./firebaseConfig";
import { getDocs, collection } from "firebase/firestore";
import styles from "../../styles/uploader.module.css";

const DEFAULT_TYPE_LABEL = "Sin tipo";

const normalizeArrayField = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
};

const getEventTypes = (eventDoc) => {
  if (Array.isArray(eventDoc.event_type)) {
    return eventDoc.event_type.map((type) => String(type).trim()).filter(Boolean);
  }
  if (Array.isArray(eventDoc.type)) {
    return eventDoc.type.map((type) => String(type).trim()).filter(Boolean);
  }
  const legacy = normalizeArrayField(eventDoc.eventType || eventDoc.types);
  return legacy.length > 0 ? legacy : [];
};

const getPrimaryType = (eventDoc) => {
  const types = getEventTypes(eventDoc);
  return types.length > 0 ? types[0] : DEFAULT_TYPE_LABEL;
};

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortMode, setSortMode] = useState("type-asc");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const eventsSnapshot = await getDocs(collection(firestore, "events"));
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(eventsData);
      } catch (fetchError) {
        console.error("Error fetching events:", fetchError);
        setError("No se pudo cargar la lista de eventos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const availableTypes = useMemo(() => {
    const typeSet = new Set();
    events.forEach((eventDoc) => {
      const types = getEventTypes(eventDoc);
      if (types.length === 0) {
        typeSet.add(DEFAULT_TYPE_LABEL);
      } else {
        types.forEach((type) => typeSet.add(type));
      }
    });
    return Array.from(typeSet).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (typeFilter === "all") {
      return events;
    }
    return events.filter((eventDoc) => {
      const types = getEventTypes(eventDoc);
      const normalizedFilter = typeFilter === DEFAULT_TYPE_LABEL ? "" : typeFilter;
      if (normalizedFilter === "") {
        return types.length === 0;
      }
      return types.includes(normalizedFilter);
    });
  }, [events, typeFilter]);

  const sortedEvents = useMemo(() => {
    const comparator = (a, b) => {
      const typeComparison =
        getPrimaryType(a).localeCompare(getPrimaryType(b), undefined, { sensitivity: "base" });
      const nameA = String(a.name || a.title || a.slug || "").toLowerCase();
      const nameB = String(b.name || b.title || b.slug || "").toLowerCase();
      const nameComparison = nameA.localeCompare(nameB);

      if (sortMode === "type-asc") {
        return typeComparison || nameComparison;
      }
      if (sortMode === "type-desc") {
        return typeComparison * -1 || nameComparison;
      }
      return nameComparison || typeComparison;
    };

    return [...filteredEvents].sort(comparator);
  }, [filteredEvents, sortMode]);

  if (isLoading) {
    return (
      <div className={styles.form}>
        <p>Cargando eventos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.form}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className={styles.title} style={{ margin: 0 }}>
          Eventos ({sortedEvents.length})
        </h2>
        <div style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p className={styles.subtitle} style={{ marginBottom: "0.25rem" }}>Filtrar por tipo</p>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={styles.input}
            >
              <option value="all">Todos los tipos</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className={styles.subtitle} style={{ marginBottom: "0.25rem" }}>Ordenar por</p>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className={styles.input}
            >
              <option value="type-asc">Tipo (A → Z)</option>
              <option value="type-desc">Tipo (Z → A)</option>
              <option value="name">Nombre (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <p>No se encontraron eventos.</p>
      ) : (
        <div className={styles.artistsList}>
          {sortedEvents.map((eventDoc) => {
            const types = getEventTypes(eventDoc);
            const displayTypes = types.length > 0 ? types.join(" • ") : DEFAULT_TYPE_LABEL;
            const scheduleCount = Array.isArray(eventDoc.dates) ? eventDoc.dates.length : 0;
            const bannerUrl = eventDoc.banner || eventDoc.flyer || eventDoc.headerImage || null;

            return (
              <div key={eventDoc.id} className={styles.artistCard}>
                <div className={styles.artistHeader}>
                  <div className={styles.artistInfo}>
                    <h3 className={styles.artistName}>
                      {eventDoc.name || eventDoc.title || "Evento sin nombre"}
                    </h3>
                    <p className={styles.artistId}>ID: {eventDoc.id}</p>
                    <p className={styles.artistOrigin}>Tipos: {displayTypes}</p>
                    {eventDoc.slug && <p className={styles.artistOrigin}>Slug: {eventDoc.slug}</p>}
                    {scheduleCount > 0 && (
                      <p className={styles.artistOrigin}>Funciones programadas: {scheduleCount}</p>
                    )}
                  </div>
                  {bannerUrl && (
                    <div className={styles.artistProfilePicture} style={{ maxWidth: "200px" }}>
                      <img
                        src={bannerUrl}
                        alt={`${eventDoc.name || eventDoc.id} banner`}
                        className={styles.profileImage}
                      />
                    </div>
                  )}
                </div>
                {eventDoc.description && Array.isArray(eventDoc.description) && eventDoc.description.length > 0 && (
                  <div className={styles.artistBio} style={{ marginTop: "1rem" }}>
                    <h4>Descripcion</h4>
                    {eventDoc.description.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
                {eventDoc.address && (
                  <p className={styles.artistOrigin} style={{ marginTop: "0.75rem" }}>
                    Direccion: {eventDoc.address}
                  </p>
                )}
                {eventDoc.googleMapsLink && (
                  <p className={styles.artistOrigin}>
                    <a href={eventDoc.googleMapsLink} target="_blank" rel="noopener noreferrer">
                      Ver en Google Maps
                    </a>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
