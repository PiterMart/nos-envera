"use client";
import Image from "next/image";
import styles from "../../styles/page.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { app, firestore } from "../firebase/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedArtists, setExpandedArtists] = useState(new Set());
  const [featuredArtwork, setFeaturedArtwork] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function fetchArtworks() {
      try {
        // Fetch artworks
        const artworksSnapshot = await getDocs(collection(firestore, "artworks"));
        const artworksData = artworksSnapshot.docs.map((doc) => ({
          id: doc.id,
          slug: doc.data().artworkSlug || doc.id, // Use `artworkSlug` for the slug
          ...doc.data(),
        }));

        // Fetch artist information for each artwork
        const artworksWithArtists = await Promise.all(
          artworksData.map(async (artwork) => {
            if (artwork.artistId) {
              try {
                const artistDocRef = doc(firestore, "artists", artwork.artistId);
                const artistDocSnap = await getDoc(artistDocRef);
                if (artistDocSnap.exists()) {
                  const artistData = artistDocSnap.data();
                  return {
                    ...artwork,
                    artist: {
                      name: artistData.name,
                      slug: artistData.slug,
                    },
                  };
                }
              } catch (error) {
                console.error("Error fetching artist for artwork:", artwork.id, error);
              }
            }
            return {
              ...artwork,
              artist: null,
            };
          })
        );

        // Group artworks by artist
        const groupedArtworks = artworksWithArtists.reduce((groups, artwork) => {
          const artistName = artwork.artist?.name || 'Unknown Artist';
          if (!groups[artistName]) {
            groups[artistName] = [];
          }
          groups[artistName].push(artwork);
          return groups;
        }, {});

        // Convert grouped object to array and sort artists alphabetically
        const sortedGroups = Object.keys(groupedArtworks)
          .sort()
          .map(artistName => ({
            artistName,
            artworks: groupedArtworks[artistName]
          }));

        setArtworks(sortedGroups);
        
        // Select a random featured artwork from all artworks
        const allArtworks = artworksWithArtists;
        if (allArtworks.length > 0) {
          const randomIndex = Math.floor(Math.random() * allArtworks.length);
          setFeaturedArtwork(allArtworks[randomIndex]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching artworks:", error);
        setIsLoading(false);
      }
    }

    fetchArtworks();
  }, []);

  const toggleArtistExpansion = (artistName) => {
    setExpandedArtists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(artistName)) {
        newSet.delete(artistName);
      } else {
        newSet.add(artistName);
      }
      return newSet;
    });
  };

  const toggleAllArtists = () => {
    if (expandedArtists.size === artworks.length) {
      // All are expanded, collapse all
      setExpandedArtists(new Set());
    } else {
      // Some or none are expanded, expand all
      setExpandedArtists(new Set(artworks.map(group => group.artistName)));
    }
  };

  const currentPath = usePathname();

  const isCurrent = (path) => {
    return currentPath === path;
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <div className={styles.leftMargin}>
        <Image
          src="/maiden 11.png"
          alt="Left margin decoration"
          width={200}
          height={800}
          className={styles.marginImage}
        />
      </div>
      
      {/* Right margin image */}
      <div className={styles.rightMargin}>
        <Image
          src="/maiden 11.png"
          alt="Right margin decoration"
          width={200}
          height={800}
          className={styles.marginImage}
        />
      </div>
        <div className={styles.page_container} style={{marginBottom: "10rem"}}>
          <div className={styles.artworks_page}>
            <div className={styles.artworks_header}>
              {/* <h1 className={styles.artworks_title} style={{fontSize: '3rem', fontFamily: 'var(--font-lovelt)', marginBottom: '2rem', paddingTop: '1rem'}}>Artworks</h1> */}
              {isLoading ? (
                <div className={styles.loading_container}>
                  <div className={styles.loading_spinner}></div>
                  <p>Loading artworks...</p>
                </div>
              ) : (
                <div className={styles.artworks_container}>
                  {/* Featured Artwork Section */}
                  {featuredArtwork && (
                    <div className={styles.featured_artwork_section}>
                      <div className={styles.featured_artwork_image}>
                        <Link href={`/artworks/${featuredArtwork.slug}`}>
                          <Image
                            src={featuredArtwork.url}
                            alt={featuredArtwork.title}
                            width={400}
                            height={400}
                            className={styles.featured_image}
                            priority={true}
                            loading="eager"
                          />
                        </Link>
                      </div>
                      <div className={styles.featured_artwork_text}>
                        <div>
                        {featuredArtwork.title && (
                          <p className={styles.featured_artwork_name}>&quot;{featuredArtwork.title}&quot;</p>
                        )}
                        {featuredArtwork.artist && (
                          <p className={styles.featured_artist_name}>by {featuredArtwork.artist.name}</p>
                        )}

                        </div>
                          <h2 className={styles.featured_title} style={{fontFamily: 'var(--font-lovelt)', color: "#707984"}}>The Complete Artwings Collection</h2>
                      </div>
                    </div>
                  )}
                  
                  {/* <div className={styles.artworks_controls}>
                    <button 
                      className={styles.toggle_all_button}
                      onClick={toggleAllArtists}
                    >
                      {expandedArtists.size === artworks.length ? 'Hide All' : 'Show All'}
                    </button>
                  </div> */}

                  {artworks.map((group) => (
                    <div key={group.artistName} className={styles.artist_artworks}>
                      <h2 
                        className={`${styles.artist_name_header} ${styles.clickable_header}`}
                        onClick={() => toggleArtistExpansion(group.artistName)}
                      >
                        <span className={styles.artist_name_text}>{group.artistName}</span>

                        {/* <span className={`${styles.expand_icon} ${expandedArtists.has(group.artistName) ? styles.expanded : styles.collapsed}`}>
                        𓇻
                        </span> */}
                        
                      </h2>
                      <div className={`${styles.artworks_grid} ${expandedArtists.has(group.artistName) ? styles.expanded : styles.collapsed}`}>
                        {group.artworks.map((artwork) => (
                          <div key={artwork.id} className={styles.artwork_card}>
                            <Link href={`/artworks/${artwork.slug}`} className={styles.artwork_link}>
                              <div className={styles.artwork_image_container}>
                                <Image
                                  src={artwork.url}
                                  alt={artwork.title}
                                  width={300}
                                  height={300}
                                  className={styles.artwork_image}
                                  loading="lazy"
                                />
                              </div>
                              <div className={styles.artwork_info}>
                                <h3 className={styles.artwork_title}>{artwork.title}</h3>
                                {artwork.artist && (
                                  <p className={styles.artwork_artist}>
                                    {/* <Link href={`/artists/${artwork.artist.slug}`} className={styles.artist_link}>
                                      {artwork.artist.name}
                                    </Link> */}
                                  </p>
                                )}
                                {artwork.availability_status && (
                                  <p className={styles.artwork_availability} style={{ 
                                    fontWeight: "400", 
                                    fontSize: "0.9rem", 
                                    color: artwork.availability_status === "SOLD" ? "#e74c3c" : 
                                           artwork.availability_status === "FOR_SALE" ? "#707984" :
                                           artwork.availability_status === "ON_AUCTION" ? "#707984" :
                                           artwork.availability_status === "ON_HOLD" ? "#9b59b6" : "#7f8c8d"
                                  }}>
                                    {artwork.availability_status.replace(/_/g, ' ')}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
