"use client";

import BackNavLinks from "../../../components/BackNavLinks";
import { use, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import pageStyles from "../../../styles/page.module.css";
import detailStyles from "../../../styles/equipoDetail.module.css";
import { firestore } from "../../firebase/firebaseConfig";
import Grid from "../../../components/grid";
import styles from "../../../styles/page.module.css";
import {
  FALLBACK_IMAGE,
  normalizeEventTypes,
  normalizeGallery,
  parseDateEntry,
  extractYear,
  normalizeArray,
  sortByYearDesc,
} from "../../../lib/eventUtils";

const Lightbox = dynamic(() => import("../../../components/Lightbox"), { ssr: false });

export default function TeamMemberPage({ params }) {
  const { memberId } = use(params);
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberEvents, setMemberEvents] = useState([]);
  const [memberEventImages, setMemberEventImages] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  useEffect(() => {
    let isMounted = true;

    const fetchMemberEvents = async () => {
      if (!member || !member.id) {
        if (isMounted) {
          setMemberEvents([]);
          setMemberEventImages([]);
          setEventsLoading(false);
        }
        return;
      }

      try {
        setEventsLoading(true);
        setEventsError(null);

        const snapshot = await getDocs(collection(firestore, "events"));
        const documents = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

        const eventsForMember = [];
        const allImages = [];
        const seenUrls = new Set();

        for (const eventDoc of documents) {
          const artists = Array.isArray(eventDoc.artists) ? eventDoc.artists : [];
          const directors = Array.isArray(eventDoc.directors) ? eventDoc.directors : [];

          const participates = [...artists, ...directors].some((person) => {
            if (!person || typeof person !== "object") return false;
            return person.memberId === member.id;
          });

          if (!participates) continue;

          const eventTypes = normalizeEventTypes(eventDoc.event_type || eventDoc.eventType || eventDoc.type);
          const dates = Array.isArray(eventDoc.dates)
            ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
            : [];
          const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || FALLBACK_IMAGE;
          const slug = eventDoc.slug || eventDoc.id;
          const title = eventDoc.name || eventDoc.title || "Evento";
          const year = extractYear(dates) ?? "—";

          eventsForMember.push({
            id: eventDoc.id,
            title,
            slug,
            imageUrl,
            year,
            eventTypes,
          });

          // Collect images: banner, flyer, gallery
          const eventName = title;
          if (eventDoc.banner && !seenUrls.has(eventDoc.banner)) {
            seenUrls.add(eventDoc.banner);
            allImages.push({ url: eventDoc.banner, alt: eventName });
          }
          if (eventDoc.flyer && eventDoc.flyer !== eventDoc.banner && !seenUrls.has(eventDoc.flyer)) {
            seenUrls.add(eventDoc.flyer);
            allImages.push({ url: eventDoc.flyer, alt: eventName });
          }
          const gallery = normalizeGallery(eventDoc.gallery);
          gallery.forEach((item, i) => {
            if (item?.url && !seenUrls.has(item.url)) {
              seenUrls.add(item.url);
              allImages.push({ url: item.url, alt: item.description || `${eventName} ${i + 1}` });
            }
          });
        }

        eventsForMember.sort(sortByYearDesc);

        if (isMounted) {
          setMemberEvents(eventsForMember);
          setMemberEventImages(allImages);
        }
      } catch (fetchError) {
        console.error("Error fetching events for member:", fetchError);
        if (isMounted) {
          setEventsError("No pudimos cargar las actividades de este miembro.");
        }
      } finally {
        if (isMounted) {
          setEventsLoading(false);
        }
      }
    };

    setMemberEvents([]);
    setMemberEventImages([]);
    setEventsError(null);
    setEventsLoading(false);

    if (member) {
      fetchMemberEvents();
    }

    return () => {
      isMounted = false;
    };
  }, [member]);

  return (
    <div className={pageStyles.page}>
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container}>
          <div className={pageStyles.contentMaxWidth}>
          {isLoading && (
            <div className={pageStyles.loading_container}>
              <div className={pageStyles.loading_spinner} />
              <p>Cargando información del miembro…</p>
            </div>
          )}

          {!isLoading && error && <p className={pageStyles.error}>{error}</p>}

          {!isLoading && !error && member && (
            <>
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
                  {member.origin && <p className={detailStyles.origin}>{member.origin}</p>}
                  {roles.length > 0 && <p className={detailStyles.roles}>{roles.join(" · ")}</p>}
                </div>
              </div>

              <div className={detailStyles.infoColumn}>
                {bioParagraphs.length > 0 && (
                  <div className={detailStyles.section}>
                    {/* <h2 className={detailStyles.sectionTitle}>Biografía</h2> */}
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
                    {/* <h2 className={detailStyles.sectionTitle}>Enlaces</h2> */}
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

                <div className={detailStyles.section}>
                  {/* <h2 className={detailStyles.sectionTitle}>Actividad</h2> */}
                  {eventsLoading ? (
                    <p className={pageStyles.loading_container}>Cargando actividades…</p>
                  ) : eventsError ? (
                    <p className={pageStyles.error}>{eventsError}</p>
                  ) : memberEvents.length === 0 ? (
                    <p className={detailStyles.paragraphs}>Todavía no hay actividades registradas para este miembro.</p>
                  ) : (
                    <Grid cards={memberEvents} hideImages={true} basePath="/evento" />
                  )}
                </div>
              </div>
            </section>

            {memberEventImages.length > 0 && (
              <div className={`${detailStyles.section} ${detailStyles.eventGallerySectionFullWidth}`}>
                <div className={detailStyles.eventGalleryGrid}>
                  {memberEventImages.map((img, index) => (
                    <figure
                      key={`gallery-${index}`}
                      style={{
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        cursor: "pointer",
                      }}
                      onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && (setLightboxIndex(index), setLightboxOpen(true))}
                      aria-label={`Ver imagen ${index + 1} en galería`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "var(--border-radius)",
                        }}
                      />
                    </figure>
                  ))}
                </div>
              </div>
            )}
            </>
          )}

          {lightboxOpen && memberEventImages.length > 0 && (
            <Lightbox
              isOpen={lightboxOpen}
              slides={memberEventImages.map((img) => ({ src: img.url, alt: img.alt }))}
              index={lightboxIndex}
              onClose={() => setLightboxOpen(false)}
            />
          )}
          <BackNavLinks links={[{ href: "/somos", label: "SOMOS" }, { href: "/comunidad", label: "COMUNIDAD" }]} />
          </div>
        </div>
      </main>
      <footer className={pageStyles.footer}></footer>
    </div>
  );
}

