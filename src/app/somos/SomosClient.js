"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { TransitionLink } from "../../components/TransitionLink";
import teamStyles from "../../styles/equipo.module.css";
import pageStyles from "../../styles/page.module.css";
import Section1 from "../../components/Section1";
import Lightbox from "../../components/Lightbox";

const ESPACIO_IMAGES = [
  "/espacio/NosEnvera-Fabrica1.jpg",
  "/espacio/NosEnvera-Fabrica2.jpg",
  "/espacio/NosEnvera-Fabrica3.jpg",
];

export default function SomosClient({ teamMembers }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const visibleMembers = useMemo(() => teamMembers.filter((member) => Boolean(member.name)), [teamMembers]);

  return (
    <>
      <Section1 />
      <section className={teamStyles.carouselSection}>
        <h1 className={pageStyles.pageHeader}>EQUIPO</h1>
        {visibleMembers.length === 0 ? (
          <p className={teamStyles.emptyState}>No hay miembros del equipo registrados todavía.</p>
        ) : (
          <div className={teamStyles.carouselViewport}>
            <ul className={teamStyles.carouselTrack}>
              {visibleMembers.map((member) => {
                const href = member.slug ? `/somos/${member.slug}` : `/somos/${member.id}`;
                const roles = Array.isArray(member.roles) ? member.roles.filter(Boolean) : [];

                return (
                  <li key={member.id} className={teamStyles.carouselSlide}>
                    <TransitionLink href={href} className={teamStyles.card}>
                      <div className={teamStyles.imageWrapper}>
                        {member.profilePicture ? (
                          <Image src={member.profilePicture} alt={`Retrato de ${member.name} - Nos Envera`} className={teamStyles.image} width={400} height={400} sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: "cover" }} />
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
        )}
      </section>
    </>
  );
}
