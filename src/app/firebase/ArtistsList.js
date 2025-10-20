"use client";
import { useEffect, useState } from "react";
import { firestore } from "./firebaseConfig";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import styles from "../../styles/uploader.module.css";

export default function ArtistsList() {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedArtists, setExpandedArtists] = useState(new Set());

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch artists
        const artistSnapshot = await getDocs(collection(firestore, "artists"));
        const artistsData = artistSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch artworks for each artist
        const artistsWithArtworks = await Promise.all(
          artistsData.map(async (artist) => {
            if (artist.artworks && artist.artworks.length > 0) {
              const artworksData = await Promise.all(
                artist.artworks.map(async (artworkId) => {
                  try {
                    const artworkDoc = await getDoc(doc(firestore, "artworks", artworkId));
                    if (artworkDoc.exists()) {
                      return {
                        id: artworkDoc.id,
                        ...artworkDoc.data()
                      };
                    }
                    return null;
                  } catch (error) {
                    console.error(`Error fetching artwork ${artworkId}:`, error);
                    return null;
                  }
                })
              );
              return {
                ...artist,
                artworks: artworksData.filter(artwork => artwork !== null)
              };
            }
            return {
              ...artist,
              artworks: []
            };
          })
        );

        setArtists(artistsWithArtworks);
      } catch (error) {
        console.error("Error fetching artists:", error);
        setError("Failed to load artists data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const toggleArtistExpansion = (artistId) => {
    setExpandedArtists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(artistId)) {
        newSet.delete(artistId);
      } else {
        newSet.add(artistId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className={styles.form}>
        <p>Loading artists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.form}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Artists ({artists.length})</h2>
      
      {artists.length === 0 ? (
        <p>No artists found.</p>
      ) : (
        <div className={styles.artistsList}>
          {artists.map((artist) => {
            const isExpanded = expandedArtists.has(artist.id);
            return (
              <div key={artist.id} className={styles.artistCard}>
                <div 
                  className={styles.artistHeader}
                  onClick={() => toggleArtistExpansion(artist.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.artistInfo}>
                    <h3 className={styles.artistName}>
                      {artist.name}
                      <span className={styles.expandIcon}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </h3>
                    <p className={styles.artistId}>ID: {artist.id}</p>
                  </div>
                  {artist.profilePicture && (
                    <div className={styles.artistProfilePicture}>
                      <img 
                        src={artist.profilePicture} 
                        alt={`${artist.name} profile`}
                        className={styles.profileImage}
                      />
                    </div>
                  )}
                </div>

                <div className={`${styles.artistDetails} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                  <div className={styles.artistBasicInfo}>
                    <p className={styles.artistOrigin}>{artist.origin}</p>
                    {artist.birthDate && (
                      <p className={styles.artistBirthDate}>
                        Born: {artist.birthDate.toDate ? artist.birthDate.toDate().toLocaleDateString() : new Date(artist.birthDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {artist.bio && artist.bio.length > 0 && (
                    <div className={styles.artistBio}>
                      <h4>Bio:</h4>
                      {artist.bio.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {artist.manifesto && artist.manifesto.length > 0 && (
                    <div className={styles.artistManifesto}>
                      <h4>Manifesto:</h4>
                      {artist.manifesto.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {artist.web && (
                    <div className={styles.artistWeb}>
                      <h4>Website:</h4>
                      <a href={artist.web} target="_blank" rel="noopener noreferrer">
                        {artist.web}
                      </a>
                    </div>
                  )}

                  {artist.cvUrl && (
                    <div className={styles.artistCv}>
                      <h4>CV:</h4>
                      <a href={artist.cvUrl} target="_blank" rel="noopener noreferrer">
                        Download CV
                      </a>
                    </div>
                  )}

                  <div className={styles.artistArtworks}>
                    <h4>Artworks ({artist.artworks.length}):</h4>
                    {artist.artworks.length === 0 ? (
                      <p>No artworks uploaded yet.</p>
                    ) : (
                      <div className={styles.artworksGrid}>
                        {artist.artworks.map((artwork) => (
                          <div key={artwork.id} className={styles.artworkCard}>
                            {artwork.url && (
                              <img 
                                src={artwork.url} 
                                alt={artwork.title}
                                className={styles.artworkThumbnail}
                              />
                            )}
                            <div className={styles.artworkInfo}>
                              <h5>{artwork.title}</h5>
                              <p className={styles.artworkId}>ID: {artwork.id}</p>
                              <p>{artwork.date}</p>
                              <p>{artwork.medium}</p>
                              {artwork.measurements && <p>{artwork.measurements}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
