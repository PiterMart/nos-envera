import React from "react";
import { firestore } from "../app/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import EventTypePageClient from "./EventTypePageClient";
import {
  parseDateEntry,
  extractYear,
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
    const q = query(
      collection(firestore, "events"),
      where("event_type", "array-contains", eventTypeFilter)
    );
    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    initialEvents = documents
      .map((eventDoc) => {
        const dates = Array.isArray(eventDoc.dates)
          ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
          : [];

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
