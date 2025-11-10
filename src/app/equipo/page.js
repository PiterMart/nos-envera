"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getDocs, collection, where, query } from "firebase/firestore";
import pageStyles from "../../styles/page.module.css";
import teamStyles from "../../styles/equipo.module.css";
import { firestore } from "../firebase/firebaseConfig";

export default function Equipo() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const carouselRef = useRef(null);

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
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

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

  const updateScrollControls = useCallback(() => {
    const container = carouselRef.current;
    if (!container) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollPrev(scrollLeft > 0);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollControls();
  }, [visibleMembers, updateScrollControls]);

  const scrollCarousel = useCallback(
    (direction) => {
      const container = carouselRef.current;
      if (!container) {
        return;
      }

      const scrollAmount = container.offsetWidth * 0.85;
      container.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });

      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(updateScrollControls);
      } else {
        updateScrollControls();
      }
    },
    [updateScrollControls]
  );

  const handleCarouselScroll = useCallback(() => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(updateScrollControls);
    } else {
      updateScrollControls();
    }
  }, [updateScrollControls]);

  const handleCardKeyDown = useCallback((event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  }, []);

  return (
    <div className={pageStyles.page}>
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container}>
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
                  {/* <div className={teamStyles.carouselControls}>
                    <button
                      type="button"
                      className={teamStyles.carouselButton}
                      onClick={() => scrollCarousel(-1)}
                      aria-label="Ver miembros anteriores"
                      disabled={!canScrollPrev}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className={teamStyles.carouselButton}
                      onClick={() => scrollCarousel(1)}
                      aria-label="Ver más miembros"
                      disabled={!canScrollNext}
                    >
                      →
                    </button>
                  </div> */}

                  <div className={teamStyles.carouselViewport} ref={carouselRef} onScroll={handleCarouselScroll}>
                    <ul className={teamStyles.carouselTrack}>
                      {visibleMembers.map((member) => {
                        const href = member.slug ? `/equipo/${member.slug}` : `/equipo/${member.id}`;
                        const roles = Array.isArray(member.roles) ? member.roles.filter(Boolean) : [];

                        return (
                          <li key={member.id} className={teamStyles.carouselSlide}>
                            <Link
                              href={href}
                              className={teamStyles.card}
                              onKeyDown={handleCardKeyDown}
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
                            </Link>
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



