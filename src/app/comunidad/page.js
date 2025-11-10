"use client";
import styles from "../../styles/page.module.css";
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export default function Comunidad() {
  const [memberNames, setMemberNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const memberLayouts = useMemo(() => {
    if (!memberNames.length) {
      return {};
    }

    return memberNames.reduce((acc, { id }) => {
      const randomTop = 10 + Math.random() * 80;
      const randomLeft = 10 + Math.random() * 80;
      const randomRotation = Math.random() * 40 - 20;
      const randomScale = 0.9 + Math.random() * 0.4;

      acc[id] = {
        top: `${randomTop}%`,
        left: `${randomLeft}%`,
        rotation: randomRotation,
        scale: randomScale,
      };
      return acc;
    }, {});
  }, [memberNames]);

  useEffect(() => {
    const fetchMemberNames = async () => {
      try {
        const membersQuery = query(
          collection(firestore, "members"),
          orderBy("name", "asc")
        );
        const snapshot = await getDocs(membersQuery);
        const names = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            name: data?.name ?? docSnapshot.id,
          };
        });
        setMemberNames(names);
      } catch (err) {
        setError("No se pudieron cargar los nombres de la comunidad.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberNames();
  }, []);

  return (
    <div
      className={styles.page}
      style={{ position: "relative", minHeight: "100vh", zIndex: 1 }}
    >
      <img
        src="/NV-isologo.png"
        alt="Nos en Vera Isologo"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "40vw",
          width: "320px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className={styles.page_container} style={{ position: "relative", zIndex: 2 }}>
        <div
          className={styles.homepage_container}
          style={{ paddingTop: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              width: "100%",
              margin: "auto",
              maxWidth: "600px",
            }}
          >
            {isLoading && (
              <p style={{ textAlign: "center", color: "#666" }}>Cargando…</p>
            )}

            {error && (
              <p style={{ textAlign: "center", color: "#c00" }}>{error}</p>
            )}

            {!isLoading && !error && (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 auto",
                  maxWidth: "800px",
                  position: "relative",
                  minHeight: "70vh",
                }}
              >
                {memberNames.map(({ id, name }) => {
                  const layout = memberLayouts[id];

                  return (
                    <li
                      key={id}
                      style={{
                        border: "none",
                        borderRadius: 0,
                        padding: 0,
                        backgroundColor: "transparent",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        fontFamily:
                          "'Avenir Next Medium', 'Avenir Next', 'AvenirNext-Medium', 'AvenirNext', sans-serif",
                        color: "#000",
                        position: "absolute",
                        top: layout?.top ?? "50%",
                        left: layout?.left ?? "50%",
                        transform: `translate(-50%, -50%) rotate(${
                          layout?.rotation ?? 0
                        }deg) scale(${layout?.scale ?? 1})`,
                        transformOrigin: "center",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        zIndex: 1,
                      }}
                    >
                      {name}
                    </li>
                  );
                })}
                {memberNames.length === 0 && (
                  <li
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "1rem",
                      backgroundColor: "#fafafa",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    No hay miembros registrados todavía.
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}