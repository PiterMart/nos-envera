import React from "react";
import { getDocs, collection, where, query } from "firebase/firestore";
import pageStyles from "../../styles/page.module.css";
import { firestore } from "../firebase/firebaseConfig";
import SomosClient from "./SomosClient";

export const metadata = {
  title: "Somos | El Equipo",
  description: "Conoce al equipo detrás de Nos en Vera, un espacio dedicado a la investigación y producción de artes performáticas.",
};

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

async function getTeamMembers() {
  try {
    const teamQuery = query(collection(firestore, "members"), where("team", "==", true));
    const snapshot = await getDocs(teamQuery);
    return snapshot.docs
      .map((memberDoc) => ({
        id: memberDoc.id,
        ...JSON.parse(JSON.stringify(memberDoc.data())),
      }))
      .sort((a, b) => {
        const aIdx = MEMBER_ORDER.indexOf(a.name || "");
        const bIdx = MEMBER_ORDER.indexOf(b.name || "");
        const aOrder = aIdx === -1 ? MEMBER_ORDER.length : aIdx;
        const bOrder = bIdx === -1 ? MEMBER_ORDER.length : bIdx;
        return aOrder - bOrder;
      });
  } catch (error) {
    console.error("Error fetching team members on server:", error);
    return [];
  }
}

export default async function EquipoPage() {
  const teamMembers = await getTeamMembers();

  return (
    <div className={pageStyles.page}>
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container}>
          <SomosClient teamMembers={teamMembers} />
        </div>
      </main>
      <footer className={pageStyles.footer}></footer>
    </div>
  );
}
