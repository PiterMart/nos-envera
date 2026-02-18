 "use client";
 
 import { TransitionLink } from "../../../components/TransitionLink";
 import { use, useEffect, useMemo, useState } from "react";
 import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
 import pageStyles from "../../../styles/page.module.css";
 import detailStyles from "../../../styles/equipoDetail.module.css";
 import { firestore } from "../../firebase/firebaseConfig";
 import Grid from "../../../components/grid";
 
 const FALLBACK_IMAGE = "https://via.placeholder.com/600x800.png?text=Event";
 
 const normalizeEventTypes = (rawTypes) => {
   if (Array.isArray(rawTypes)) {
     return rawTypes.map((type) => String(type).trim()).filter(Boolean);
   }
   if (typeof rawTypes === "string" && rawTypes.trim()) {
     return rawTypes.split(",").map((type) => type.trim()).filter(Boolean);
   }
   return [];
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
 
   if (!parsedDate && !time) {
     return null;
   }
 
   return { date: parsedDate, time };
 };
 
 const extractYear = (dates = []) => {
   const entry = dates.find((item) => item?.date) || null;
   if (!entry) return null;
   if (entry.date?.toDate) {
     return entry.date.toDate().getFullYear();
   }
   if (entry.date instanceof Date) {
     return entry.date.getFullYear();
   }
   const parsed = new Date(entry.date);
   return Number.isNaN(parsed.getTime()) ? null : parsed.getFullYear();
 };

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

export default function ComunidadMemberPage({ params }) {
  const { memberId } = use(params);
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberEvents, setMemberEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

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

        // Check if member is part of the team - comunidad members should not be in the team
        if (memberData.team === true) {
          throw new Error("Este miembro forma parte del equipo interno.");
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

  useEffect(() => {
    let isMounted = true;
 
    const fetchMemberEvents = async () => {
      if (!member || !member.id) {
        if (isMounted) {
          setMemberEvents([]);
          setEventsLoading(false);
        }
        return;
      }
 
      try {
        setEventsLoading(true);
        setEventsError(null);
 
        const snapshot = await getDocs(collection(firestore, "events"));
        const documents = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
 
        const eventsForMember = documents
          .map((eventDoc) => {
            const artists = Array.isArray(eventDoc.artists) ? eventDoc.artists : [];
            const directors = Array.isArray(eventDoc.directors) ? eventDoc.directors : [];
 
            const participates = [...artists, ...directors].some((person) => {
              if (!person || typeof person !== "object") return false;
              return person.memberId === member.id;
            });
 
            if (!participates) return null;
 
            const eventTypes = normalizeEventTypes(eventDoc.event_type || eventDoc.eventType || eventDoc.type);
            const dates = Array.isArray(eventDoc.dates)
              ? eventDoc.dates.map(parseDateEntry).filter(Boolean)
              : [];
            const imageUrl = eventDoc.banner || eventDoc.flyer || eventDoc.gallery?.[0]?.url || FALLBACK_IMAGE;
            const slug = eventDoc.slug || eventDoc.id;
            const title = eventDoc.name || eventDoc.title || "Evento";
            const year = extractYear(dates) ?? "—";
 
            return {
              id: eventDoc.id,
              title,
              slug,
              imageUrl,
              year,
              eventTypes,
            };
          })
          .filter(Boolean)
          .sort((a, b) => {
            if (a.year === "—" && b.year !== "—") return 1;
            if (a.year !== "—" && b.year === "—") return -1;
            return String(b.year).localeCompare(String(a.year));
          });
 
        if (isMounted) {
          setMemberEvents(eventsForMember);
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
    setEventsError(null);
    setEventsLoading(false);
 
    if (member) {
      fetchMemberEvents();
    }
 
    return () => {
      isMounted = false;
    };
  }, [member]);
 
  const roles = useMemo(() => normalizeArray(member?.roles), [member]);
  const bioParagraphs = useMemo(() => normalizeArray(member?.bio), [member]);
  const manifestoParagraphs = useMemo(() => normalizeArray(member?.manifesto), [member]);
  const formattedBirthDate = useMemo(() => formatDate(member?.birthDate), [member]);

  return (
    <div className={pageStyles.page}>
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container}>
          <div className={detailStyles.backRow}>
            <TransitionLink href="/comunidad" direction="back" className={detailStyles.backLink}>
              <span aria-hidden>←</span>
              <span>Volver a comunidad</span>
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
                {member.profilePicture && member.profilePicture.trim() && (
                  <div className={detailStyles.imageWrapper}>
                    <img src={member.profilePicture} alt={`Retrato de ${member.name}`} className={detailStyles.image} />
                  </div>
                )}

                <div className={detailStyles.identityCard}>
                  <h1 className={detailStyles.name}>{member.name}</h1>
                  {roles.length > 0 && <p className={detailStyles.roles}>{roles.join(" · ")}</p>}
                </div>
              </div>

              <div className={`${detailStyles.infoColumn} ${detailStyles.infoColumnMaxWidth}`}>
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
 
                <div className={detailStyles.section}>
                  <h2 className={detailStyles.sectionTitle}>Actividad</h2>
                  {eventsLoading ? (
                    <p className={pageStyles.loading_container}>Cargando actividades…</p>
                  ) : eventsError ? (
                    <p className={pageStyles.error}>{eventsError}</p>
                  ) : memberEvents.length === 0 ? (
                    <p className={detailStyles.paragraphs}>Todavía no hay actividades registradas para este miembro.</p>
                  ) : (
                    <Grid cards={memberEvents} hideImages={true} />
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      <footer className={pageStyles.footer}></footer>
    </div>
  );
}





