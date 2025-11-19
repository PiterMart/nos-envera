"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { firestore } from "../app/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import styles from "./RecentEvents.module.css";

const formatDate = (value) => {
  if (!value) return null;

  let date;
  if (value?.toDate) {
    date = value.toDate();
  } else {
    date = new Date(value);
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const parseDateEntry = (entry) => {
  if (!entry) return null;
  let dateValue = entry.date;
  let parsedDate = null;

  if (dateValue?.toDate) {
    parsedDate = dateValue.toDate();
  } else if (typeof dateValue === "string" || typeof dateValue === "number") {
    const attempt = new Date(dateValue);
    if (!Number.isNaN(attempt.getTime())) {
      parsedDate = attempt;
    }
  } else if (dateValue instanceof Date) {
    parsedDate = dateValue;
  }

  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    parsedDate = null;
  }

  const time = typeof entry.time === "string" ? entry.time.trim() : "";

  return { date: parsedDate, time };
};

const getEarliestDate = (eventDoc) => {
  if (!Array.isArray(eventDoc.dates) || eventDoc.dates.length === 0) {
    return null;
  }

  const validDates = eventDoc.dates
    .map((entry) => parseDateEntry(entry)?.date)
    .filter((date) => date !== null);

  if (validDates.length === 0) {
    return null;
  }

  return new Date(Math.min(...validDates.map((d) => d.getTime())));
};

const getFirstDateAndTime = (eventDoc) => {
  if (!Array.isArray(eventDoc.dates) || eventDoc.dates.length === 0) {
    return { date: null, time: null };
  }

  const firstEntry = eventDoc.dates.find((entry) => {
    const parsed = parseDateEntry(entry);
    return parsed && parsed.date !== null;
  });

  if (!firstEntry) {
    return { date: null, time: null };
  }

  const parsed = parseDateEntry(firstEntry);
  return {
    date: parsed?.date || null,
    time: parsed?.time || null,
  };
};

const getDirectors = (eventDoc) => {
  if (!Array.isArray(eventDoc.directors) || eventDoc.directors.length === 0) {
    return [];
  }

  return eventDoc.directors
    .map((director) => {
      if (typeof director === "string") {
        return director.trim();
      }
      if (director && typeof director === "object") {
        return String(director.name || director.fullName || director.displayName || "").trim();
      }
      return null;
    })
    .filter(Boolean);
};

export default function RecentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(firestore, "events"));
        const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Sort events by earliest date (most recent first)
        const sortedEvents = documents.sort((a, b) => {
          const dateA = getEarliestDate(a);
          const dateB = getEarliestDate(b);

          // Events without dates go to the end
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          // Most recent first
          return dateB.getTime() - dateA.getTime();
        });

        // Get the last 3 events
        const lastThree = sortedEvents.slice(0, 3);

        setEvents(lastThree);
      } catch (fetchError) {
        console.error("Error fetching events:", fetchError);
        setError("No se pudieron cargar los eventos.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return null; // Or return a loading state if needed
  }

  if (error) {
    return null; // Or return an error state if needed
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.tejesDiv}>TEJES</div>
      {events.map((event, index) => {
        const { date, time } = getFirstDateAndTime(event);
        const formattedDate = date ? formatDate(date) : null;
        const eventName = event.name || event.title || "Evento sin nombre";
        const directors = getDirectors(event);
        const directorsText = directors.length > 0 ? directors.join(", ") : null;

        const eventSlug = event.slug || event.id;
        const eventHref = `/agenda/${eventSlug}`;

        return (
          <Link key={event.id} href={eventHref} className={styles.eventItem}>
            {directorsText && (
              <span className={styles.director}>
                {`${directorsText} · `}
              </span>
            )}
            {eventName}
            {(formattedDate || time) && (
              <span className={styles.dateTime}>
                {formattedDate && time
                  ? ` · ${formattedDate} ${time}`
                  : formattedDate
                  ? ` · ${formattedDate}`
                  : time
                  ? ` · ${time}`
                  : ""}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

