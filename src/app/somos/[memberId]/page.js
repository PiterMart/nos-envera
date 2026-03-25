import React from "react";
import pageStyles from "../../../styles/page.module.css";
import { firestore } from "../../firebase/firebaseConfig";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import TeamMemberClient from "./TeamMemberClient";
import {
  FALLBACK_IMAGE,
  normalizeEventTypes,
  normalizeGallery,
  parseDateEntry,
  extractYear,
  sortByYearDesc,
} from "../../../lib/eventUtils";

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
    console.error("Error fetching team member for metadata:", error);
  }

  if (!member) return { title: "Miembro no encontrado" };

  return {
    title: `${member.name} | Equipo`,
    description: (Array.isArray(member.bio) ? member.bio[0] : member.bio || "").substring(0, 160),
    openGraph: {
      title: member.name,
      description: member.origin || "Miembro del equipo Nos en Vera",
      images: [member.profilePicture || ""],
    },
  };
}

async function getTeamMemberData(memberId) {
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

    const snapshot = await getDocs(collection(firestore, "events"));
    const documents = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

    const memberEvents = [];
    const memberEventImages = [];
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

      memberEvents.push({
        id: eventDoc.id,
        title,
        slug,
        imageUrl,
        year,
        eventTypes,
      });

      if (eventDoc.banner && !seenUrls.has(eventDoc.banner)) {
        seenUrls.add(eventDoc.banner);
        memberEventImages.push({ url: eventDoc.banner, alt: title });
      }
      if (eventDoc.flyer && eventDoc.flyer !== eventDoc.banner && !seenUrls.has(eventDoc.flyer)) {
        seenUrls.add(eventDoc.flyer);
        memberEventImages.push({ url: eventDoc.flyer, alt: title });
      }
      const gallery = normalizeGallery(eventDoc.gallery);
      gallery.forEach((item, i) => {
        if (item?.url && !seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          memberEventImages.push({ url: item.url, alt: item.description || `${title} ${i + 1}` });
        }
      });
    }

    memberEvents.sort(sortByYearDesc);

    return { member, memberEvents, memberEventImages };
  } catch (error) {
    console.error("Error fetching team member data:", error);
    return null;
  }
}

export default async function TeamMemberPage({ params }) {
  const { memberId } = await params;
  const data = await getTeamMemberData(memberId);

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

  const { member, memberEvents, memberEventImages } = data;

  return (
    <div className={pageStyles.page}>
      <main className={pageStyles.main}>
        <div className={pageStyles.page_container}>
          <div className={pageStyles.contentMaxWidth}>
            <TeamMemberClient 
              member={member} 
              memberEvents={memberEvents} 
              memberEventImages={memberEventImages} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
