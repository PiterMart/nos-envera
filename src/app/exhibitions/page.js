"use client";
import styles from "../../styles/page.module.css";
import { firestore } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Exhibitions() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headquarters, setHeadquarters] = useState([]);

  useEffect(() => {
    const fetchHeadquarters = async () => {
      try {
        const headquartersSnapshot = await getDocs(collection(firestore, "headquarters"));
        const headquartersData = headquartersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHeadquarters(headquartersData);
      } catch (error) {
        console.error("Error fetching headquarters:", error);
      }
    };

    fetchHeadquarters();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "exhibitions"));
      const exhibitionsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        exhibitionsData.push({ id: doc.id, ...data });
      });

      // Sort exhibitions by opening date (most recent first)
      const sortedExhibitions = exhibitionsData.sort((a, b) => {
        const dateA = new Date(a.openingDate.toDate());
        const dateB = new Date(b.openingDate.toDate());
        return dateB - dateA; // Most recent first
      });

      setExhibitions(sortedExhibitions);
    } catch (error) {
      console.error("Error fetching exhibitions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  if (loading) return <p>Loading exhibitions...</p>;

  // Helper function to format dates
  const formatDate = (date) => {
    if (!date) return "TBD";
    return new Date(date.toDate()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get address from headquarters
  const getAddress = (exhibition) => {
    const hq = headquarters.find((hq) => hq.exhibitions && hq.exhibitions.includes(exhibition.id));
    return hq ? hq.address : "Address TBD";
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.exhibitions_page}>
          <div className={styles.exhibition_list}>
            {exhibitions.map((exhibition) => (
              <Link key={exhibition.id} href={`/exhibitions/${exhibition.slug}`} className={styles.exhibition_card}>
                <div className={styles.exhibition_info}>
                  <h3 className={styles.exhibition_name}>{exhibition.name}</h3>
                  {/* <div className={styles.exhibition_details}>
                    <p className={styles.exhibition_date}>
                      <span className={styles.date_label}>Opening:</span> {formatDate(exhibition.openingDate)}
                    </p>
                    <p className={styles.exhibition_date}>
                      <span className={styles.date_label}>Closing:</span> {formatDate(exhibition.closingDate)}
                    </p>
                    <p className={styles.exhibition_address}>
                      <span className={styles.address_label}>Location:</span> {getAddress(exhibition)}
                    </p>
                  </div> */}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
