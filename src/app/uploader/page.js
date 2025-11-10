"use client";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import styles from "../../styles/uploader.module.css";
import ComunidadUploader from "../firebase/ComunidadUploader";
import EventUploader from "../firebase/EventUploader";
import PressUploader from "../firebase/PressUploader";
import CommunityList from "../firebase/CommunityList";
import EventList from "../firebase/EventList";

export default function Home() {
  const [activeSection, setActiveSection] = useState("community");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Checking authentication...");
  
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("User Status:", currentUser);
      setUser(currentUser);
    });
  
    return () => unsubscribe();
  }, []);
  

  const handleLogin = async () => {
    setError(""); // Clear previous errorsL
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError("Invalid email or password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  if (!user) {
    return (
      <div className={styles.loginContainer}> {/* Add CSS Module class */}
        <h2 className={styles.loginTitle}>Hello. <br></br> Login to access the admin panel.</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.formGroup}>
        <p className={styles.helpText}>Email</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.input}
          />
          <p className={styles.helpText}>Password</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.input}
          />
          <p className={styles.helpText}>Forgot your password? Contact the administrator.</p>
          <button onClick={handleLogin} className={styles.loginButton}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ maxWidth: "1500px", paddingTop: "10rem" }}>
        {/* Logout Button */}
        {/* <button onClick={handleLogout} style={{ position: "absolute", top: 20, right: 20 }}>
          Logout
        </button> */}

        {/* Navigation Buttons */}
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
        <div style={{ margin: "auto" }}>
          <p className={styles.title}> What are you working on?</p>
        </div>
        <div className={styles.navContainer}>
          <button onClick={() => setActiveSection("community")} className={styles.navButton}>Community</button>
          <button onClick={() => setActiveSection("artistsList")} className={styles.navButton}>Community List</button>
          <button onClick={() => setActiveSection("events")} className={styles.navButton}>Eventos</button>
          <button onClick={() => setActiveSection("press")} className={styles.navButton}>Prensa</button>
          <button onClick={() => setActiveSection("eventsList")} className={styles.navButton}>Event List</button>

          {/* <button onClick={runMigration} className={styles.subtitle} style={{ backgroundColor: "#ff6b6b", color: "white" }}>Migrate Artworks</button> */}
          {/* <button onClick={() => setActiveSection("fair")} className={styles.subtitle}>Fairs</button>
          <button onClick={() => setActiveSection("headquarter")} className={styles.subtitle}>Headquarters</button> */}
        </div>

        {/* Events Section */}
        {activeSection === "events" && (
          <div id="events" style={{ width: "100%", padding: "1rem", display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1000px", margin: "auto" }}>
            <p className={styles.title}>EVENTOS UPLOADER</p>
            <EventUploader />
          </div>
        )}

        {/* Press Section */}
        {activeSection === "press" && (
          <div id="press" style={{ width: "100%", padding: "1rem", display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1000px", margin: "auto" }}>
            <p className={styles.title}>PRENSA UPLOADER</p>
            <PressUploader />
          </div>
        )}

        {/* Community Members List Section */}
        {activeSection === "artistsList" && (
          <div id="community-list" style={{ width: "100%", padding: "1rem", display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1000px", margin: "auto" }}>
            <p className={styles.title}>LISTA DE LA COMUNIDAD</p>
            <CommunityList />
          </div>
        )}

        {/* Events List Section */}
        {activeSection === "eventsList" && (
          <div id="events-list" style={{ width: "100%", padding: "1rem", display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1000px", margin: "auto" }}>
            <p className={styles.title}>LISTA DE EVENTOS</p>
            <EventList />
          </div>
        )}

        {/* Community Section */}
        {activeSection === "community" && (
          <div id="community" style={{ width: "100%", padding: "1rem", display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1000px", margin: "auto" }}>
            <p className={styles.title}>COMUNIDAD UPLOADER</p>
            <ComunidadUploader />
          </div>
        )}

      </main>
    </div>
  );
}
