 "use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { TransitionLink } from "../../components/TransitionLink";
import { getDocs, collection, where, query } from "firebase/firestore";
import pageStyles from "../../styles/page.module.css";
import teamStyles from "../../styles/equipo.module.css";
import { firestore } from "../firebase/firebaseConfig";
import Section1 from "../../components/Section1";
import Lightbox from "../../components/Lightbox";

const MEMBER_ORDER = [
  "Dominique Melhem",
  "Laura Rod",
  "Jan Valente",
  "Javier Olivera",
  "Ángel Odessky",
  "Olivia Milberg",
  "Ana Belén Rodríguez",
  "Nicolás Dodi",
  "Rodolfo Opazo",
];

const ESPACIO_IMAGES = [
  "/espacio/NosEnvera-Fabrica1.jpg",
  "/espacio/NosEnvera-Fabrica2.jpg",
  "/espacio/NosEnvera-Fabrica3.jpg",
];

export default function Equipo() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const teamQuery = query(collection(firestore, "members"), where("team", "==", true));
        const snapshot = await getDocs(teamQuery);
        const membersData = snapshot.docs
          .map((memberDoc) => ({
            id: memberDoc.id,
            ...memberDoc.data(),
          }))
          .sort((a, b) => {
          const aIdx = MEMBER_ORDER.indexOf(a.name || "");
          const bIdx = MEMBER_ORDER.indexOf(b.name || "");
          const aOrder = aIdx === -1 ? MEMBER_ORDER.length : aIdx;
          const bOrder = bIdx === -1 ? MEMBER_ORDER.length : bIdx;
          return aOrder - bOrder;
        });

        if (isMounted) {
          setTeamMembers(membersData);
        }
      } catch (fetchError) {
        console.error("Error fetching team members:", fetchError);
        if (isMounted) {
          setError("No se pudieron cargar los miembros del equipo en este momento.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTeamMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleMembers = useMemo(() => teamMembers.filter((member) => Boolean(member.name)), [teamMembers]);

  return (
    <div className={pageStyles.page}>
      <Section1 />
      <section className={teamStyles.espacioGallery}>
        <div className={teamStyles.espacioGrid}>
          <div
            className={`${teamStyles.espacioImageWrapper} ${teamStyles.espacioImageFullWidth}`}
            role="button"
            tabIndex={0}
            onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
            onKeyDown={(e) => e.key === "Enter" && (setLightboxIndex(0), setLightboxOpen(true))}
            aria-label="Abrir imagen 1 en galería"
          >
            <Image
              src={ESPACIO_IMAGES[0]}
              alt="Nos en Vera espacio 1"
              width={1200}
              height={600}
              className={teamStyles.espacioImage}
              sizes="100vw"
            />
          </div>
          {ESPACIO_IMAGES.slice(1).map((src, i) => (
            <div
              key={src}
              className={teamStyles.espacioImageWrapper}
              role="button"
              tabIndex={0}
              onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
              onKeyDown={(e) => e.key === "Enter" && (setLightboxIndex(i + 1), setLightboxOpen(true))}
              aria-label={`Abrir imagen ${i + 2} en galería`}
            >
              <Image
                src={src}
                alt={`Nos en Vera espacio ${i + 2}`}
                width={600}
                height={400}
                className={teamStyles.espacioImage}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
        <Lightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          slides={ESPACIO_IMAGES.map((src, i) => ({ src, alt: `Nos en Vera espacio ${i + 1}` }))}
          index={lightboxIndex}
        />
      </section>
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container}>
          {/* <header className={pageStyles.pageHeader}>
            <h1>EQUIPO NV</h1>
          </header> */}
          {/* <p className={pageStyles.pageSubtext}>Lorem ipsum dolor sit amet, consectetur adipiscin dolor sit amet, consectetur adipiscin.</p> */}
          {isLoading && (
            <div className={pageStyles.loading_container}>
              <div className={pageStyles.loading_spinner} />
              <p>Cargando miembros del equipo…</p>
            </div>
          )}  

          {!isLoading && error && <p className={pageStyles.error}>{error}</p>}

          {!isLoading && !error && (
            <section className={teamStyles.carouselSection}>
              {visibleMembers.length === 0 ? (
                <p className={teamStyles.emptyState}>No hay miembros del equipo registrados todavía.</p>
              ) : (
                <>
                  <div className={teamStyles.carouselViewport}>
                    <ul className={teamStyles.carouselTrack}>
                      {visibleMembers.map((member) => {
                        const href = member.slug ? `/somos/${member.slug}` : `/somos/${member.id}`;
                        const roles = Array.isArray(member.roles) ? member.roles.filter(Boolean) : [];

                        return (
                          <li key={member.id} className={teamStyles.carouselSlide}>
                            <TransitionLink
                              href={href}
                              className={teamStyles.card}
                            >
                              <div className={teamStyles.imageWrapper}>
                                {member.profilePicture ? (
                                  <img src={member.profilePicture} alt={`Retrato de ${member.name}`} className={teamStyles.image} />
                                ) : (
                                  <div className={teamStyles.imagePlaceholder} aria-hidden>
                                    {member.name?.charAt(0) ?? "?"}
                                  </div>
                                )}
                              </div>
                              <div className={teamStyles.cardBody}>
                                <h2 className={teamStyles.cardTitle}>{member.name}</h2>
                                {roles.length > 0 && (
                                  <p className={teamStyles.cardRoles}>{roles.join(" · ")}</p>
                                )}
                              </div>
                            </TransitionLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </main>
      <footer className={pageStyles.footer}></footer>
    </div>
  );
}



