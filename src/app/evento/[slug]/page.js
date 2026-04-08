import React from "react";
import styles from "../../../styles/page.module.css";
import { firestore } from "../../firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import EventClient from "./EventClient";
import { normalizeEventDoc } from "../../../lib/eventUtils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let performance = null;

  try {
    const docRef = doc(firestore, "events", slug);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      performance = normalizeEventDoc(snapshot.data(), snapshot.id);
    } else {
      const slugQuery = query(collection(firestore, "events"), where("slug", "==", slug));
      const slugSnapshot = await getDocs(slugQuery);
      if (!slugSnapshot.empty) {
        performance = normalizeEventDoc(slugSnapshot.docs[0].data(), slugSnapshot.docs[0].id);
      }
    }
  } catch (error) {
    console.error("Error fetching event for metadata:", error);
  }

  if (!performance) {
    return {
      title: "Actividad no encontrada",
    };
  }

  const firstDate = performance?.dates?.[0]?.date;
  const year = firstDate ? (firstDate.toDate ? firstDate.toDate().getFullYear() : new Date(firstDate).getFullYear()) : "";

  return {
    title: `${performance.name}${year ? ` (${year})` : ""}`,
    description: performance.subtitle || (performance.description?.[0] || "").substring(0, 160),
    openGraph: {
      title: performance.name,
      description: performance.subtitle,
      images: [performance.banner || performance.flyer || ""],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: performance.name,
      description: performance.subtitle,
      images: [performance.banner || performance.flyer || ""],
    },
  };
}

export const revalidate = 3600; // revalidate every hour

async function getEvent(slug) {
  try {
    const docRef = doc(firestore, "events", slug);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const normalized = normalizeEventDoc(snapshot.data(), snapshot.id);
      if (normalized) return normalized;
    }

    const slugQuery = query(collection(firestore, "events"), where("slug", "==", slug));
    const slugSnapshot = await getDocs(slugQuery);
    if (!slugSnapshot.empty) {
      return normalizeEventDoc(slugSnapshot.docs[0].data(), slugSnapshot.docs[0].id);
    }
  } catch (err) {
    console.error("Error fetching event on server:", err);
  }
  return null;
}

export default async function EventDetail({ params }) {
  const { slug } = await params;
  const performance = await getEvent(slug);

  if (!performance) {
    return (
      <div className={styles.page}>
        <div className={styles.page_container}>
          <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              No encontramos la actividad solicitada.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstDate = performance?.dates?.find?.((entry) => entry?.date) || null;
  const year = firstDate ? (firstDate.date?.toDate ? firstDate.date.toDate().getFullYear() : new Date(firstDate.date).getFullYear()) : null;

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div
            className={styles.contentMaxWidth}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <header className={styles.pageHeaderSmall} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", marginBottom: 0 }}>
              <h1 className={styles.eventTitle} style={{ fontWeight: 600, letterSpacing: "1px", marginBottom: 0, fontFamily: "var(--font-family-base)" }}>
                {performance.name || "Actividad"}
                {year ? (
                  <span style={{ fontSize: "1.5rem", fontWeight: 400, color: "#666", marginLeft: "0.5rem" }}>
                    · {year}
                  </span>
                ) : null}
              </h1>
            </header>

            <EventClient performance={performance} />
          </div>
        </div>
      </div>
    </div>
  );
}
