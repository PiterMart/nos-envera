 "use client";
import { useEffect, useState, useMemo } from "react";
import { TransitionLink } from "./TransitionLink";
import { firestore } from "../app/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import styles from "../styles/RecentEvents.module.css";

import {
  formatDate,
  getEarliestDate,
  getFirstDateAndTime,
  getDirectorNames,
} from "../lib/eventUtils";

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
      <TransitionLink href="/agenda" className={styles.tejesDiv}>
        AGENDA
      </TransitionLink>
      {events.map((event, index) => {
        const { date, time } = getFirstDateAndTime(event);
        const formattedDate = date ? formatDate(date) : null;
        const eventName = event.name || event.title || "Evento sin nombre";
        const directors = getDirectorNames(event.directors);
        const directorsText = directors.length > 0 ? directors.join(", ") : null;

        const eventSlug = event.slug || event.id;
        const eventHref = `/archivo/${eventSlug}`;

        return (
          <TransitionLink key={event.id} href={eventHref} className={styles.eventItem}>
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
          </TransitionLink>
        );
      })}
    </div>
  );
}

