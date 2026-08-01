import { useEffect, useState } from "react";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";

const COLLECTION_NAME = "WatchHistory";
const MAX_ENTRIES = 30;

// ---- Record that a user watched a video (call once per watch-page visit) ----
export async function addToHistory(uid, video) {
  if (!uid || !video) return;
  const ref = doc(db, COLLECTION_NAME, uid);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data().entries || [] : [];

  // Remove any older entry for the same video, then put this one at the front
  const withoutThisVideo = existing.filter((e) => e.videoId !== video.id);
  const updated = [
    {
      videoId: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      watchedAt: new Date().toISOString(),
    },
    ...withoutThisVideo,
  ].slice(0, MAX_ENTRIES);

  await setDoc(ref, { entries: updated }, { merge: true });
}

// ---- Live watch history for a user ----
export function useWatchHistory(uid) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, COLLECTION_NAME, uid), (snap) => {
      setEntries(snap.exists() ? snap.data().entries || [] : []);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  return { entries, loading };
}
