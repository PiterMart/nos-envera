"use client";
import Image from "next/image";
import styles from "../../../styles/page.module.css";
import { firestore } from "../../firebase/firebaseConfig"; 
import { query, collection, where, getDocs, doc, getDoc } from "firebase/firestore"; 
import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import EmblaCarousel from "../../carousel/EmblaCarousel";

// Helper function to convert Firestore timestamp to a date string
function convertTimestampToYear(timestamp) {
  if (timestamp && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000); 
    return date.getFullYear().toString(); 
  }
  return null;
}

export default function Artist({ params }) {
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const artistSlug = use(params).artist;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchArtistData = async () => {
      try {
        setError(null);

        const artistQuery = query(
          collection(firestore, "artists"),
          where("slug", "==", artistSlug)
        );
        const artistSnapshot = await getDocs(artistQuery);

        if (!artistSnapshot.empty) {
          const artistDoc = artistSnapshot.docs[0];
          const artistData = artistDoc.data();

          const formattedArtist = {
            ...artistData,
            id: artistDoc.id,
            birthDate: convertTimestampToYear(artistData.birthDate),
          };

          setArtist(formattedArtist);

          if (artistData.artworks && artistData.artworks.length > 0) {
            const artworkDetails = await fetchArtworksByIds(artistData.artworks);
            setArtworks(artworkDetails);
          }
        } else {
          setError("Artist not found.");
        }
      } catch (err) {
        console.error("Error fetching artist:", err);
        setError("Could not load artist data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistSlug]);

  // Fetch artworks from the `artworks` collection by IDs
  const fetchArtworksByIds = async (artworkIds) => {
    try {
      const artworkPromises = artworkIds.map(async (id) => {
        const artworkDoc = await getDoc(doc(firestore, "artworks", id));
        return { id: artworkDoc.id, ...artworkDoc.data() };
      });

      return Promise.all(artworkPromises);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      return [];
    }
  };


  
  if (isLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.leftMargin2}>
            <Image
              src="/maiden 2.PNG"
              alt=""
              width={200}
              height={800}
              className={styles.marginImage2}
            />
          </div>
          <div className={styles.page_container}>
            <div className={styles.artist_skeleton}>
              <div className={styles.artist_header}>
                                 <div className={styles.profile_container}>
                   <div className={styles.profile_image_skeleton}></div>
                 </div>
                <div className={styles.artist_info}>
                  <div className={styles.title_skeleton}></div>
                  <div>
                    <div className={styles.subtitle_skeleton}></div>
                    <div className={styles.subtitle_skeleton}></div>
                  </div>
                </div>
              </div>
              <div className={styles.artist_page}>
                <div className={styles.artist_page_contents}>
                  <div className={styles.bio_skeleton}></div>
                  {artworks && artworks.length > 0 && (
                    <div className={styles.artworks_skeleton}>
                      <div className={styles.title_skeleton}></div>
                      <div className={styles.carousel_skeleton}></div>
                    </div>
                  )}
                  <div className={styles.bio_skeleton}>
                    <div className={styles.title_skeleton}></div>
                    <div className={styles.paragraph_skeleton}></div>
                    <div className={styles.paragraph_skeleton}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer className={styles.footer}></footer>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.page_container}>
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
              <p style={{ fontSize: "1.1rem", color: "#666" }}>
                {error || "Artist not found."}
              </p>
              <Link href="/artists" style={{ display: "inline-block", marginTop: "1.5rem", color: "#222", borderBottom: "1px solid #222", textDecoration: "none" }}>
                ← Back to artists
              </Link>
            </div>
          </div>
        </main>
        <footer className={styles.footer}></footer>
      </div>
    );
  }

  const artworkSlides = artworks.map((artwork) => ({
    title: artwork.title,
    url: artwork.url,
    medium: artwork.medium,
    extras: artwork.extras,
    slug: artwork.artworkSlug,
    date: artwork.date,
    measurements: artwork.measurements,
    description: artwork.description,
  }));

  const OPTIONS = {};

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <div className={styles.leftMargin2}>
        <Image
          src="/maiden 2.PNG"
          alt="Left margin decoration"
          width={200}
          height={800}
          className={styles.marginImage2}
        />
      </div>
        <div className={styles.page_container}>
          <div className={styles.artist_content_loaded}>
            <div className={styles.artist_header}>
            {artist.profilePicture && (
                    <div className={styles.profile_container}>
                   <img
                     src={artist.profilePicture}
                     alt={`${artist.name}'s profile`}
                     className={`${styles.profile_image} ${imageLoaded ? styles.profile_image_loaded : ''}`}
                     width={200}
                     height={200}
                     style={{ objectFit: 'cover' }}
                     onLoad={() => setImageLoaded(true)}
                   />
                  <Image
                    src="/webframeartwings_1.png"
                    alt="Profile frame"
                    width={200}
                    height={200}
                    className={styles.profile_frame}
                  />
                </div>
              )}
              <div className={styles.artist_info}>
                <h1 className={styles.title} style={{ paddingTop: "5rem" }}>
                  {artist.name}
                </h1>
                <div>
                  <h1 className={styles.subtitle}>{artist.origin},</h1>
                  <h1 className={styles.subtitle}>{artist.birthDate}.</h1>
                </div>
              </div>
            </div>
            <div className={styles.artist_page}>
              <div className={styles.artist_page_contents}>
                {/* <div>
                  <p style={{ fontSize: '1.5rem', lineHeight: "1.75rem", textAlign: 'left'}}>{artist.bio[0]}</p>
                </div> */}
                                  {Array.isArray(artist.bio) && artist.bio.length > 0 && (
                  <>
                    <p className={styles.title} style={{marginBottom: '-1rem', marginTop: '1rem', fontSize: '2rem', textAlign: 'center'}}>BIO</p>
                    <div
                      className={styles.artist_page_contents_bio}
                      id="bio"
                    >
                      {artist.bio.map((paragraph, index) => (
                        <div key={index}>
                          <p>{paragraph}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {artworks && artworks.length > 0 && (
                  <div
                    className={styles.artist_page_contents_obras}
                    id="obras"
                    style={{ scrollMargin: "10rem", marginTop: '5rem' }}
                  >
                    {/* <p className={styles.title}>ARTWORKS</p> */}
                    <EmblaCarousel slides={artworkSlides} type="artwork" />
                  </div>
                )}
          </div>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
