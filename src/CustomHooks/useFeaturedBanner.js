import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";

const COLLECTION_NAME = "FeaturedBanner";

// ---- Add a new featured slide ----
export async function addFeaturedSlide({
  title,
  description,
  imageUrl,
  linkVideoId,
  addedByEmail,
}) {
  if (!title || !imageUrl) {
    throw new Error("Title and image are required");
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    title,
    description: description || "",
    imageUrl,
    linkVideoId: linkVideoId || null,
    addedByEmail: addedByEmail || "",
    createdAt: new Date().toISOString(),
  });
}

// ---- Live list of featured slides, oldest-added first ----
export function useFeaturedBanner() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setSlides(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { slides, loading };
}

// ---- Remove a slide (admin only, also gate with Firestore rules) ----
export async function deleteFeaturedSlide(id) {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
