 "use client";
import { useEffect, useMemo, useState } from "react";
import { TransitionLink } from "../../components/TransitionLink";
import { getDocs, collection, where, query } from "firebase/firestore";
import pageStyles from "../../styles/page.module.css";
import teamStyles from "../../styles/equipo.module.css";
import { firestore } from "../firebase/firebaseConfig";
import Section1 from "../../components/Section1";

export default function Equipo() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className={pageStyles.page}>
      <Section1 />
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container} style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header className={pageStyles.pageHeader}>
            <h1>NUESTRO EQUIPO</h1>
          </header>
          <p className={pageStyles.pageSubtext}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis. Ut pharetra augue nec augue. Nam elit magna, hendrerit sit amet, tincidunt ac, viverra sed, nulla. Donec porta diam eu massa. Quisque diam lorem, interdum vitae, dapibus ac, scelerisque.</p>
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



