"use client";

import { TransitionLink } from "../../../components/TransitionLink";
import { use, useEffect, useMemo, useState } from "react";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import pageStyles from "../../../styles/page.module.css";
import detailStyles from "../../../styles/equipoDetail.module.css";
import { firestore } from "../../firebase/firebaseConfig";

const formatDate = (value) => {
  if (!value) {
    return null;
  }

  try {
    const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date", error);
    return null;
  }
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
};

export default function TeamMemberPage({ params }) {
  const { memberId } = use(params);
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMember = async () => {
      if (!memberId) {
        setError("Identificador del miembro no válido.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const memberRef = doc(firestore, "members", memberId);
        const memberDoc = await getDoc(memberRef);

        let memberData = null;

        if (memberDoc.exists()) {
          memberData = {
            id: memberDoc.id,
            ...memberDoc.data(),
          };
        } else {
          const slugQuery = query(collection(firestore, "members"), where("slug", "==", memberId));
          const slugSnapshot = await getDocs(slugQuery);

          if (!slugSnapshot.empty) {
            const slugDoc = slugSnapshot.docs[0];
            memberData = {
              id: slugDoc.id,
              ...slugDoc.data(),
            };
          }
        }

        if (!memberData) {
          throw new Error("Miembro no encontrado.");
        }

        if (isMounted) {
          setMember(memberData);
        }
      } catch (fetchError) {
        console.error("Error fetching member:", fetchError);
        if (isMounted) {
          setError(fetchError.message || "No se pudo cargar la información del miembro.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMember();

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  const roles = useMemo(() => normalizeArray(member?.roles), [member]);
  const bioParagraphs = useMemo(() => normalizeArray(member?.bio), [member]);
  const manifestoParagraphs = useMemo(() => normalizeArray(member?.manifesto), [member]);
  const formattedBirthDate = useMemo(() => formatDate(member?.birthDate), [member]);

  return (
    <div className={pageStyles.page}>
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container}>
          <div className={pageStyles.contentMaxWidth}>
          <div className={detailStyles.backRow}>
            <TransitionLink href="/equipo" direction="back" className={detailStyles.backLink}>
              <span aria-hidden>←</span>
              <span>Volver a equipo</span>
            </TransitionLink>
          </div>

          {isLoading && (
            <div className={pageStyles.loading_container}>
              <div className={pageStyles.loading_spinner} />
              <p>Cargando información del miembro…</p>
            </div>
          )}

          {!isLoading && error && <p className={pageStyles.error}>{error}</p>}

          {!isLoading && !error && member && (
            <section className={detailStyles.profile}>
              <div className={detailStyles.mediaColumn}>
                <div className={detailStyles.imageWrapper}>
                  {member.profilePicture ? (
                    <img src={member.profilePicture} alt={`Retrato de ${member.name}`} className={detailStyles.image} />
                  ) : (
                    <div className={detailStyles.imagePlaceholder} aria-hidden>
                      {member.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>

                <div className={detailStyles.identityCard}>
                  <h1 className={detailStyles.name}>{member.name}</h1>
                  {roles.length > 0 && <p className={detailStyles.roles}>{roles.join(" · ")}</p>}
                </div>
              </div>

              <div className={detailStyles.infoColumn}>
                <div className={detailStyles.metaList}>
                  {member.origin && (
                    <p className={detailStyles.metaItem}>
                      <strong>Origen:</strong> {member.origin}
                    </p>
                  )}
                  {formattedBirthDate && (
                    <p className={detailStyles.metaItem}>
                      <strong>Nacimiento:</strong> {formattedBirthDate}
                    </p>
                  )}
                  {member.team && (
                    <p className={detailStyles.metaItem}>
                      <strong>Equipo interno</strong>
                    </p>
                  )}
                </div>

                {bioParagraphs.length > 0 && (
                  <div className={detailStyles.section}>
                    <h2 className={detailStyles.sectionTitle}>Biografía</h2>
                    <div className={detailStyles.paragraphs}>
                      {bioParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}

                {manifestoParagraphs.length > 0 && (
                  <div className={detailStyles.section}>
                    <h2 className={detailStyles.sectionTitle}>Manifiesto</h2>
                    <div className={detailStyles.paragraphs}>
                      {manifestoParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}

                {(member.web || member.cvUrl) && (
                  <div className={detailStyles.section}>
                    <h2 className={detailStyles.sectionTitle}>Enlaces</h2>
                    <div className={detailStyles.links}>
                      {member.web && (
                        <a href={member.web} target="_blank" rel="noopener noreferrer" className={detailStyles.link}>
                          Sitio web
                        </a>
                      )}
                      {member.cvUrl && (
                        <a href={member.cvUrl} target="_blank" rel="noopener noreferrer" className={detailStyles.link}>
                          Ver CV
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
          </div>
        </div>
      </main>
      <footer className={pageStyles.footer}></footer>
    </div>
  );
}

