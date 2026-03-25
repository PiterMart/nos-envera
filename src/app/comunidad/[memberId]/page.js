import React from "react";
import pageStyles from "../../../styles/page.module.css";
import { firestore } from "../../firebase/firebaseConfig";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import MemberClient from "./MemberClient";
import { normalizeEventTypes, parseDateEntry, extractYear, sortByYearDesc, FALLBACK_IMAGE } from "../../../lib/eventUtils";

export async function generateMetadata({ params }) {
  const { memberId } = await params;
  let member = null;

  try {
    const memberRef = doc(firestore, "members", memberId);
    const memberDoc = await getDoc(memberRef);

    if (memberDoc.exists()) {
      member = { id: memberDoc.id, ...JSON.parse(JSON.stringify(memberDoc.data())) };
    } else {
      const slugQuery = query(collection(firestore, "members"), where("slug", "==", memberId));
      const slugSnapshot = await getDocs(slugQuery);
      if (!slugSnapshot.empty) {
        member = { id: slugSnapshot.docs[0].id, ...JSON.parse(JSON.stringify(slugSnapshot.docs[0].data())) };
      }
    }
  } catch (error) {
    console.error("Error fetching member for metadata:", error);
  }

  if (!member) return { title: "Miembro no encontrado" };

  return {
    title: `${member.name} | Comunidad`,
    description: (Array.isArray(member.bio) ? member.bio[0] : member.bio || "").substring(0, 160),
    openGraph: {
      title: member.name,
      description: member.origin || "Miembro de la comunidad Nos en Vera",
      images: [member.profilePicture || ""],
    },
  };
}

async function getMemberData(memberId) {
  try {
    let member = null;
    const memberRef = doc(firestore, "members", memberId);
    const memberDoc = await getDoc(memberRef);

    if (memberDoc.exists()) {
      member = { id: memberDoc.id, ...JSON.parse(JSON.stringify(memberDoc.data())) };
    } else {
      const slugQuery = query(collection(firestore, "members"), where("slug", "==", memberId));
      const slugSnapshot = await getDocs(slugQuery);
      if (!slugSnapshot.empty) {
        member = { id: slugSnapshot.docs[0].id, ...JSON.parse(JSON.stringify(slugSnapshot.docs[0].data())) };
      }
    }

    if (!member) return null;

    // Fetch member events
    const snapshot = await getDocs(collection(firestore, "events"));
    const documents = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

    const memberEvents = documents
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
      .sort(sortByYearDesc);

    return { member, memberEvents };
  } catch (error) {
    console.error("Error fetching member data on server:", error);
    return null;
  }
}

export default async function ComunidadMemberPage({ params }) {
  const { memberId } = await params;
  const data = await getMemberData(memberId);

  if (!data) {
    return (
      <div className={pageStyles.page}>
        <div className={pageStyles.page_container}>
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <p>No encontramos el perfil solicitado.</p>
          </div>
        </div>
      </div>
    );
  }

  const { member, memberEvents } = data;

  return (
    <div className={pageStyles.page}>
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container}>
          <div className={pageStyles.contentMaxWidth}>
            <MemberClient member={member} memberEvents={memberEvents} />
          </div>
        </div>
      </main>
    </div>
  );
}
