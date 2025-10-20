"use client";
import styles from "../../../styles/artwork.module.css";
// import pageStyles from "../../../styles/page.module.css";
import "../../../styles/page.module.css";
import { firestore } from "../../firebase/firebaseConfig";
import { query, collection, where, getDocs, doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Lightbox from "../../../components/Lightbox";
import AcquireDialog from "../../../components/AcquireDialog";

export default function Artwork({ params }) {
  const [artwork, setArtwork] = useState(undefined); // Undefined for initial loading state
  const [artist, setArtist] = useState(null); // To store artist details
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '' });
  const [isAcquireDialogOpen, setIsAcquireDialogOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const artworkSlug = params.artwork; // Get slug from params

  const openLightbox = (imageSrc, imageAlt) => {
    setLightboxImage({ src: imageSrc, alt: imageAlt });
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const openAcquireDialog = () => {
    setIsAcquireDialogOpen(true);
  };

  const closeAcquireDialog = () => {
    setIsAcquireDialogOpen(false);
  };

  useEffect(() => {
    const fetchArtworkAndArtist = async () => {
      try {
        console.log("Fetching artwork with slug:", artworkSlug);

        // Query the 'artworks' collection for the specific slug
        const q = query(collection(firestore, "artworks"), where("artworkSlug", "==", artworkSlug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // There should only be one document for the given slug
          const docSnap = querySnapshot.docs[0];
          const artworkData = docSnap.data();

          setArtwork({
            id: docSnap.id,
            ...artworkData,
          });

          // Fetch artist details using the stored artist ID or reference
          if (artworkData.artistId) {
            const artistDocRef = doc(firestore, "artists", artworkData.artistId);
            const artistDocSnap = await getDoc(artistDocRef);

            if (artistDocSnap.exists()) {
              const artistData = artistDocSnap.data();
              setArtist({
                name: artistData.name,
                slug: artistData.slug,
              });
            } else {
              console.error("Artist not found for artwork.");
              setArtist(null);
            }
          } else {
            console.warn("No artistId found in artwork document.");
          }
        } else {
          setArtwork(null); // No artwork found for this slug
        }
      } catch (error) {
        console.error("Error fetching artwork or artist:", error);
        setArtwork(null); // Explicit null for error state
      }
    };

    fetchArtworkAndArtist();
  }, [artworkSlug]);

  if (artwork === undefined) return <p style={{ fontFamily: 'Inter, sans-serif' }}>Loading...</p>; // Loading state for text content
  if (artwork === null) return <p style={{ fontFamily: 'Inter, sans-serif' }}>Error fetching artwork. Please try again.</p>;

  const { title, url, images, date, medium, measurements, description, price, availability_status } = artwork;
  
  // Main image is the url field, secondary images are from the images array
  const mainImage = url;
  const secondaryImages = images && images.length > 0 ? images : [];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.artwork_page}>
          <div className={styles.artwork_details}>
            <p className={styles.title} style={{ fontWeight: "400", fontFamily: 'Inter, sans-serif', fontSize: '1.5rem' }}>{title}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {artist ? (
                <Link href={`/artists/${artist.slug}`}>
                  <h2 style={{ fontWeight: "300", fontFamily: 'var(--font-lovelt)' }}>{artist.name}</h2>
                </Link>
              ) : (
                <h2 style={{ fontWeight: "300", fontFamily: 'var(--font-lovelt)' }}>Unknown Artist</h2>
              )}
              <p style={{ fontFamily: 'Inter, sans-serif' }}>{date}</p>
              <p style={{ fontFamily: 'Inter, sans-serif' }}>{medium}</p>
              <p style={{ fontFamily: 'Inter, sans-serif' }}>{measurements}</p>
              {/* {price && <p style={{ fontWeight: "500", fontSize: "1.1rem" }}>${price.toLocaleString()}</p>} */}
              {availability_status && (
                <p style={{ 
                  fontWeight: "400", 
                  fontSize: "0.7rem", 
                  fontFamily: 'Inter, sans-serif',
                  color: availability_status === "SOLD" ? "#707984" : 
                         availability_status === "FOR_SALE" ? "#707984" :
                         availability_status === "ON_AUCTION" ? "#707984" :
                         availability_status === "ON_HOLD" ? "#9b59b6" : "#707984"
                }}>
                  {availability_status.replace(/_/g, ' ')}
                </p>
              )}
              <p style={{ marginTop: "2rem", fontFamily: 'Inter, sans-serif' }}>{description}</p>
              {availability_status !== "NOT_FOR_SALE" && (
                <button 
                  onClick={openAcquireDialog}
                  style={{
                    marginTop: "2rem",
                    padding: "0.875rem 1.75rem",
                    background: "none",
                    color: "#707984",
                    // border: "1px solid #707984",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "300",
                    transition: "all 0.3s ease",
                    marginRight: "0",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#000";
                    e.target.style.borderColor = "#000";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#707984";
                    e.target.style.borderColor = "#707984";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Acquire
                </button>
              )}
            </div>
            {/* <div style={{ alignSelf: "flex-end" }}>
              <button
                onClick={() => window.history.back()}
                className={styles.back_link}
              >
                <p style={{ fontSize: "1rem", fontWeight: "100", color: '#707984' }}>
                  {"<"} Back
                </p>
              </button>
            </div> */}
          </div>
          <div className={styles.artwork_image_container}>
            {isImageLoading && (
              <div className={styles.image_loading_placeholder}>
                <div className={styles.loading_spinner}></div>
                <p style={{ fontFamily: 'var(--font-lovelt)' }}>Loading image...</p>
              </div>
            )}
            <img
              src={mainImage}
              alt={title}
              style={{ 
                width: "100%", 
                height: "auto", 
                maxWidth: "800px",
                maxHeight: "80vh",
                cursor: "pointer",
                display: isImageLoading ? "none" : "block"
              }}
              onClick={() => openLightbox(mainImage, title)}
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
            
            {/* Secondary Images */}
            {secondaryImages.length > 0 && (
              <div className={styles.secondary_images_container}>
                {secondaryImages.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`${title} - View ${index + 2}`}
                    className={styles.secondary_image}
                    onClick={() => openLightbox(imgUrl, `${title} - View ${index + 2}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}></footer>

      {/* Lightbox Component */}
      <Lightbox
        isOpen={isLightboxOpen}
        imageSrc={lightboxImage.src}
        imageAlt={lightboxImage.alt}
        onClose={closeLightbox}
      />

      {/* Acquire Dialog Component */}
      <AcquireDialog
        isOpen={isAcquireDialogOpen}
        onClose={closeAcquireDialog}
        artwork={artwork}
        artist={artist}
      />
    </div>
  );
}
