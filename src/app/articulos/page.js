// Refactored to Server Component for SEO.
import React from "react";
import styles from "../../styles/page.module.css";
import { firestore } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import ArticlesClient from "./ArticlesClient";

export const metadata = {
  title: "Artículos",
  description: "Explora nuestra colección de artículos, investigaciones y publicaciones sobre performance y artes escénicas en Nos en Vera.",
};

async function getArticles() {
  try {
    const snapshot = await getDocs(collection(firestore, "articles"));
    return snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data() || {};
        const rawDate = data.date;
        const date =
          rawDate && typeof rawDate.toDate === "function"
            ? rawDate.toDate().toISOString() // Convert to string for serialization
            : rawDate instanceof Date
              ? rawDate.toISOString()
              : rawDate;

        const links = Array.isArray(data.links)
          ? data.links
              .map((entry) => ({
                title: (entry?.title || "").trim(),
                url: (entry?.url || "").trim(),
              }))
              .filter((entry) => entry.url)
          : typeof data.link === "string" && data.link.trim()
            ? [{ title: "", url: data.link.trim() }]
            : [];

        const coverImage =
          typeof data.coverImage === "string" && data.coverImage.trim()
            ? data.coverImage.trim()
            : typeof data.image === "string" && data.image.trim()
              ? data.image.trim()
              : "";

        return {
          id: docSnap.id,
          title: data.title || "Sin título",
          subtitle: data.subtitle || "",
          description: data.description || "",
          links,
          date,
          coverImage,
        };
      })
      .sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime;
      });
  } catch (err) {
    console.error("Failed to load article items on server:", err);
    return [];
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className={styles.page}>
      <div className={styles.page_container}>
        <div className={styles.homepage_container} style={{ paddingTop: "2rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              width: "100%",
              margin: "auto",
            }}
          >
            <header className={styles.pageHeader}>
              <h1>ARTÍCULOS</h1>
            </header>
            <p className={styles.pageSubtext}>
              Investigaciones, registros y reflexiones sobre la práctica artística y performática contemporánea.
            </p>

            <ArticlesClient initialArticles={articles} />
          </div>
        </div>
      </div>
    </div>
  );
}
