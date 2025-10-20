"use client";
import Image from "next/image";
import styles from "../../styles/page.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { app, firestore } from "../firebase/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function ArtistsPageWithWheel() {
  const [artists, setArtists] = useState([]);
  const [randomArtwork, setRandomArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const wheelRef = useRef(null);
  const wheelContainerRef = useRef(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchY, setLastTouchY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastTime, setLastTime] = useState(0);

  useEffect(() => {
    async function fetchArtistsAndArtworks() {
      try {
        // Fetch artists
        const querySnapshot = await getDocs(collection(firestore, "artists"));
        const artistsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Fetch artworks separately
        const artworksSnapshot = await getDocs(collection(firestore, "artworks"));
        const artworksData = artworksSnapshot.docs.map((doc) => ({
          id: doc.id,
          slug: doc.data().artworkSlug || doc.id, // Use `artworkSlug` for the slug
          ...doc.data(),
        }));
  
        // Associate artworks with artists
        const artistsWithArtworks = artistsData.map((artist) => ({
          ...artist,
          artworks: artworksData.filter((artwork) => artist.artworks?.includes(artwork.id)),
        }));
  
        // Set artists in their original order first
        setArtists(artistsWithArtworks);
  
        // Select a random artwork
        if (artworksData.length > 0) {
          const randomArt = artworksData[Math.floor(Math.random() * artworksData.length)];
          setRandomArtwork(randomArt);
        }
        
        // Set loading to false after data is loaded
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching artists or artworks:", error);
        setIsLoading(false);
      }
    }
  
    fetchArtistsAndArtworks();
  }, []);

  // Randomize artists order after data is loaded (client-side randomization after hydration)
  useEffect(() => {
    if (artists.length > 0) {
      const shuffledArtists = [...artists].sort(() => Math.random() - 0.5);
      setArtists(shuffledArtists);
    }
  }, [artists.length]); // Only run when artists array length changes (after initial load)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Wheel functionality
  useEffect(() => {
    if (!isMobile || !wheelRef.current) return;

    const wheel = wheelRef.current;
    let animationId;

    const updateWheel = () => {
      if (wheel) {
        wheel.style.transform = `translate(-50%, -50%) rotateY(${wheelRotation}deg)`;
      }
      animationId = requestAnimationFrame(updateWheel);
    };

    updateWheel();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [wheelRotation, isMobile]);

  // Touch handlers for wheel
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setLastTouchY(e.touches[0].clientY);
    setLastTime(Date.now());
    setVelocity(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    const currentTime = Date.now();
    const deltaY = currentY - lastTouchY;
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime > 0) {
      const newVelocity = deltaY / deltaTime;
      setVelocity(newVelocity);
      setWheelRotation(prev => prev + deltaY * 0.8);
    }
    
    setLastTouchY(currentY);
    setLastTime(currentTime);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Apply momentum with damping
    if (Math.abs(velocity) > 0.05) {
      const momentum = velocity * 200;
      setWheelRotation(prev => prev + momentum);
      
      // Gradually reduce momentum
      const dampingInterval = setInterval(() => {
        setVelocity(prev => prev * 0.95);
        if (Math.abs(velocity) < 0.01) {
          clearInterval(dampingInterval);
        }
      }, 16);
    }
  };

  // Auto-rotation when not dragging
  useEffect(() => {
    if (!isMobile || isDragging) return;

    const interval = setInterval(() => {
      setWheelRotation(prev => prev + 0.1);
    }, 16);

    return () => clearInterval(interval);
  }, [isMobile, isDragging]);

  const currentPath = usePathname();

  const isCurrent = (path) => {
    return currentPath === path;
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.page_container} style={{marginBottom: "10rem"}}>
        {/* Left margin image */}
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
          <div className={styles.artists_page}>
            <div className={styles.name_list}>
              <p className={styles.artists_title} style={{fontSize: '3rem', fontFamily: 'var(--font-lovelt)', marginBottom: '2rem', paddingTop: '1rem'}}>Artists</p>
              {isLoading ? (
                <div className={styles.loading_container}>
                  <div className={styles.loading_spinner}></div>
                  <p>Loading artists...</p>
                </div>
              ) : (
                <ul className={`${styles.name_list} ${styles.name_list_loaded}`}>
                  {artists.map((artist) => (
                    <li key={artist.id}>
                      <Link href={`/artists/${artist.slug}`}>{artist.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* <div
              className={styles.artists_image}
              style={{
                background: "transparent",
                width: "100%",
                height: "auto",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              {randomArtwork ? (
                <Link href={`/artworks/${randomArtwork.slug}`}>
                  <img
                    src={randomArtwork.url}
                    alt={randomArtwork.title}
                    width={500}
                    height={500}
                    loading="lazy"
                    style={{
                      margin: "auto",
                      width: "auto",
                      maxHeight: "50vh",
                      height: "100%",
                      display: "block",
                    }}
                  />
                </Link>
              ) : (
                <p></p>
              )}
            </div> */}
          </div>
        </div>
      </main>
      <footer className={styles.footer}></footer>
      
      {/* Mobile Wheel Overlay */}
      {isMobile && (
        <div 
          className={styles.mobileWheelContainer}
          ref={wheelContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.mobileWheelTitle}>Artists</div>
          <div className={styles.mobileWheelInstruction}>
            Swipe up or down to spin the wheel
          </div>
          <div 
            className={styles.mobileWheel}
            ref={wheelRef}
          >
            {artists.map((artist, index) => {
              // Create a vertical wheel effect
              const totalItems = artists.length;
              const wheelRadius = 300;
              
              // Calculate position in the wheel
              const normalizedRotation = wheelRotation % 360;
              const itemAngle = (index * 360) / totalItems;
              const currentAngle = (itemAngle + normalizedRotation) % 360;
              
              // Convert to vertical wheel coordinates (Y-axis rotation)
              const x = Math.sin(currentAngle * Math.PI / 180) * wheelRadius;
              const z = Math.cos(currentAngle * Math.PI / 180) * wheelRadius;
              const y = 0; // Keep items at same height
              
              // Calculate opacity and scale based on distance from center
              const distanceFromCenter = Math.abs(z);
              const maxDistance = wheelRadius;
              const opacity = Math.max(0.2, 1 - (distanceFromCenter / maxDistance) * 0.6);
              const scale = Math.max(0.7, 1 - (distanceFromCenter / maxDistance) * 0.3);
              
              return (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  className={styles.mobileWheelItem}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px) translate(-50%, -50%) scale(${scale})`,
                    opacity: opacity,
                    zIndex: Math.round(1000 - distanceFromCenter),
                  }}
                >
                  {artist.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


