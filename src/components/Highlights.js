"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/Highlights.module.css";
import { firestore } from "../app/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FALLBACK_IMAGE, getFirstDateAndTime, formatDate } from "../lib/eventUtils";
import { TransitionLink } from "./TransitionLink";

export default function Highlights() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(firestore, "events"));
        const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter events where isFeatured is true or "true"
        const filtered = documents.filter(doc =>
          doc.isFeatured === true || String(doc.isFeatured).toLowerCase() === "true"
        );

        const processed = filtered.map(eventDoc => {
          const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || FALLBACK_IMAGE;
          const slug = eventDoc.slug || eventDoc.id;
          const title = eventDoc.name || eventDoc.title || "Evento";

          const { date } = getFirstDateAndTime(eventDoc);
          const formattedDate = date ? date.getFullYear() : null;

          return {
            id: eventDoc.id,
            title,
            slug,
            imageUrl,
            formattedDate
          };
        });

        setFeaturedEvents(processed);
      } catch (err) {
        console.error("Error fetching featured events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  if (loading) {
    return null;
  }

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <div className={styles.carouselContainer}>
      {/* <h2 className={styles.carouselTitle}>Highlights</h2> */}
      <div className={styles.carouselTrack}>
        {featuredEvents.map(event => (
          <TransitionLink key={event.id} href={`/evento/${event.slug}`} className={styles.carouselItem}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.imageUrl}
              alt={event.title}
              className={styles.carouselImage}
              loading="lazy"
            />
            <div className={styles.carouselOverlay}>
              <span className={styles.carouselItemTitle}>
                {event.title}
                {event.formattedDate && <span className={styles.carouselItemDate}> - {event.formattedDate}</span>}
              </span>
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
