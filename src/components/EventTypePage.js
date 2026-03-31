import React from "react";
import { firestore } from "../app/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import EventTypePageClient from "./EventTypePageClient";
import {
  parseDateEntry,
  extractYear,
  isPastEvent,
  normalizeEventTypes,
  eventContainsPerformance,
  eventContainsTraining,
  eventContainsResidency,
  PERFORMANCE_TYPES,
  TRAINING_TYPES,
  RESIDENCY_TYPE,
} from "../lib/eventUtils";

export default async function EventTypePage({
  title,
  subtext,
  eventTypeFilter,
  emptyStateText,
  defaultImageAlt,
  basePath = "/evento"
}) {
  let initialEvents = [];
  try {
    // Fetch all to be robust against field name variations (event_type vs eventType)
    const snapshot = await getDocs(collection(firestore, "events"));
    const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    initialEvents = documents
      .map((eventDoc) => {
        const eventTypes = normalizeEventTypes(
          eventDoc.event_type || eventDoc.eventType || eventDoc.type
        );
        
        // Robust type matching
        let matchesType = false;
        if (PERFORMANCE_TYPES.includes(eventTypeFilter)) {
          matchesType = eventContainsPerformance(eventTypes);
        } else if (TRAINING_TYPES.includes(eventTypeFilter)) {
          matchesType = eventContainsTraining(eventTypes);
        } else if (eventTypeFilter === RESIDENCY_TYPE) {
          matchesType = eventContainsResidency(eventTypes);
        } else {
          // Fallback to literal match if not in constants
          matchesType = eventTypes.includes(eventTypeFilter);
        }

        if (!matchesType) return null;

        const dates = Array.isArray(eventDoc.dates)
          ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
          : [];

        // ONLY RENDER EVENTS THAT ALREADY PASSED (exclusive to Agenda)
        if (!isPastEvent(dates)) return null;

        const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || null;
        const slug = eventDoc.slug || eventDoc.id;
        const eventTitle = eventDoc.name || eventDoc.title || defaultImageAlt;
        const year = extractYear(dates) ?? "—";

        return {
          id: eventDoc.id,
          title: eventTitle,
          slug,
          imageUrl,
          year,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error(`Error fetching ${title} on server:`, err);
  }

  return (
    <EventTypePageClient
      title={title}
      subtext={subtext}
      initialEvents={initialEvents}
      emptyStateText={emptyStateText}
      basePath={basePath}
    />
  );
}
