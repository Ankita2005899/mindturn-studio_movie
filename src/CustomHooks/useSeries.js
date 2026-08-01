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

const COLLECTION_NAME = "Series";

// ---- Create a new series (playlist of existing uploaded videos) ----
export async function createSeries({
  title,
  description,
  thumbnailUrl,
  videoIds,
  createdByEmail,
}) {
  if (!title || !thumbnailUrl) {
    throw new Error("Title and thumbnail are required");
  }
  if (!videoIds || videoIds.length === 0) {
    throw new Error("Pick at least one video for this series");
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    title,
    description: description || "",
    thumbnailUrl,
    videoIds,
    createdByEmail: createdByEmail || "",
    createdAt: new Date().toISOString(),
  });
}

// ---- Live list of all series ----
export function useAllSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setSeries(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { series, loading };
}

// ---- One series by id (live) ----
export function useSeriesById(id) {
  const { series, loading } = useAllSeries();
  const found = series.find((s) => s.id === id) || null;
  return { series: found, loading };
}

// ---- Delete a series (admin only, also gate with Firestore rules) ----
export async function deleteSeries(id) {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
