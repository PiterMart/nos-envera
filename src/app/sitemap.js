import { firestore } from "../app/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default async function sitemap() {
  const baseUrl = "https://www.nosenvera.com";

  // Static routes
  const staticRoutes = [
    "",
    "/somos",
    "/articulos",
    "/agenda",
    "/archivo",
    "/performances",
    "/formaciones",
    "/residencias",
    "/contacto",
    "/artistas",
    "/comunidad",
    "/historia",
    "/directores",
    "/sala",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic routes from Firestore
  let eventRoutes = [];
  let memberRoutes = [];
  let artistRoutes = [];

  try {
    // 1. Events
    const eventsSnapshot = await getDocs(collection(firestore, "events"));
    eventRoutes = eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      return {
        url: `${baseUrl}/evento/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      };
    });

    // 2. Members (Comunidad & Somos)
    const membersSnapshot = await getDocs(collection(firestore, "members"));
    memberRoutes = membersSnapshot.docs.map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      const isTeam = data.team === true;
      const basePath = isTeam ? "/somos" : "/comunidad";
      return {
        url: `${baseUrl}${basePath}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      };
    });

    // 3. Artists
    const artistsSnapshot = await getDocs(collection(firestore, "artists"));
    artistRoutes = artistsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      return {
        url: `${baseUrl}/artists/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      };
    });
  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    // Fallback to only static routes if Firestore fails
  }

  return [...staticRoutes, ...eventRoutes, ...memberRoutes, ...artistRoutes];
}
