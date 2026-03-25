"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import pageStyles from "../../../styles/page.module.css";
import detailStyles from "../../../styles/equipoDetail.module.css";
import Grid from "../../../components/grid";
import BackNavLinks from "../../../components/BackNavLinks";

import {
  normalizeArray,
} from "../../../lib/eventUtils";

export default function MemberClient({ member, memberEvents }) {
  const roles = useMemo(() => normalizeArray(member?.roles), [member]);
  const bioParagraphs = useMemo(() => normalizeArray(member?.bio), [member]);
  const manifestoParagraphs = useMemo(() => normalizeArray(member?.manifesto), [member]);

  return (
    <section className={detailStyles.profile}>
      <div className={detailStyles.mediaColumn}>
        {member.profilePicture && member.profilePicture.trim() && (
          <div className={detailStyles.imageWrapper}>
            <Image src={member.profilePicture} alt={`Retrato de ${member.name} - Nos Envera`} className={detailStyles.image} width={400} height={400} sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
          </div>
        )}

        <div className={detailStyles.identityCard}>
          <h1 className={detailStyles.name}>{member.name}</h1>
          {member.origin && <p className={detailStyles.origin}>{member.origin}</p>}
          {roles.length > 0 && <p className={detailStyles.roles}>{roles.join(" · ")}</p>}
        </div>
      </div>

      <div className={`${detailStyles.infoColumn} ${detailStyles.infoColumnMaxWidth}`}>
        {bioParagraphs.length > 0 && (
          <div className={detailStyles.section}>
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
          {memberEvents.length === 0 ? (
            <p className={detailStyles.paragraphs}>Todavía no hay actividades registradas para este miembro.</p>
          ) : (
            <Grid cards={memberEvents} hideImages={true} basePath="/evento" />
          )}
        </div>

        <BackNavLinks links={[{ href: "/comunidad", label: "COMUNIDAD" }]} />
      </div>
    </section>
  );
}
