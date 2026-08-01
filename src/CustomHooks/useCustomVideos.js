import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
} from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";

const COLLECTION_NAME = "CustomVideos";

// Pulls a YouTube video ID out of a full URL or accepts a raw ID
export const extractYoutubeId = (input) => {
  if (!input) return "";
  const trimmed = input.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?&\s]+)/,
    /(?:youtube\.com\/embed\/)([^?&\s]+)/,
    /(?:youtube\.com\/shorts\/)([^?&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  // If nothing matched, assume the user pasted the raw video ID already
  if (/^[a-zA-Z0-9_-]{6,20}$/.test(trimmed)) return trimmed;

  return "";
};

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ---- Site-wide + per-category rollup (one doc: SiteAnalytics/global) ----
async function bumpSiteAnalytics(updates) {
  const ref = doc(db, "SiteAnalytics", "global");
  await setDoc(ref, updates, { merge: true });
}

export function useSiteAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "SiteAnalytics", "global"), (snap) => {
      setData(snap.exists() ? snap.data() : { totalViews: 0, totalLikes: 0, totalVideos: 0, categories: {} });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { data, loading };
}

// ---- Upload a new video (via YouTube link + a pasted thumbnail image URL) ----
// No Firebase Storage used here on purpose — avoids requiring the paid
// Blaze plan. The thumbnail is just a link (e.g. from postimages.org,
// imgbb.com, or any image hosting site).
export async function uploadCustomVideo({
  title,
  description,
  category,
  youtubeUrlOrId,
  thumbnailUrl,
  uploaderEmail,
}) {
  const youtubeId = extractYoutubeId(youtubeUrlOrId);
  if (!youtubeId) {
    throw new Error(
      "Couldn't read a valid YouTube video ID/URL. Please double check the link."
    );
  }
  if (!thumbnailUrl || !thumbnailUrl.trim()) {
    throw new Error("Please paste a thumbnail image URL.");
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    title: title || "Untitled",
    description: description || "",
    category: category || "General",
    videoType: "youtube",
    youtubeId,
    videoUrl: null,
    thumbnailUrl: thumbnailUrl.trim(),
    uploaderEmail: uploaderEmail || "",
    createdAt: new Date().toISOString(),
    views: 0,
    watchTimeSeconds: 0,
    likes: [],
    comments: [],
    viewLog: [],
    watchLog: [],
  });

  await bumpSiteAnalytics({
    totalVideos: increment(1),
    [`categories.${category || "General"}.videoCount`]: increment(1),
  });

  return docRef.id;
}

// ---- Live list of all uploaded videos, newest first ----
export function useAllCustomVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setVideos(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { videos, loading };
}

// ---- Live list of videos where `fieldName` array-contains this uid ----
// Used for the Liked page (fieldName: "likes") and My List page (fieldName: "savedBy")
export function useVideosByField(fieldName, uid) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, COLLECTION_NAME), where(fieldName, "array-contains", uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [fieldName, uid]);

  return { videos, loading };
}

// ---- Live single video by id ----
export function useCustomVideo(id) {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, COLLECTION_NAME, id), (snap) => {
      if (snap.exists()) {
        setVideo({ id: snap.id, ...snap.data() });
      } else {
        setVideo(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  return { video, loading };
}

// ---- Delete (admin only, also gate this with Firestore rules) ----
export async function deleteCustomVideo(id) {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// ---- Edit an existing video's details (admin only) ----
export async function updateCustomVideo(id, { title, description, category, youtubeUrlOrId, thumbnailUrl }) {
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (thumbnailUrl !== undefined && thumbnailUrl.trim()) updates.thumbnailUrl = thumbnailUrl.trim();
  if (youtubeUrlOrId !== undefined && youtubeUrlOrId.trim()) {
    const youtubeId = extractYoutubeId(youtubeUrlOrId);
    if (!youtubeId) {
      throw new Error("Couldn't read a valid YouTube video ID/URL.");
    }
    updates.youtubeId = youtubeId;
  }
  await updateDoc(doc(db, COLLECTION_NAME, id), updates);
}

// ---- My List (save/unsave a video to watch later) ----
export async function toggleSaveToList(id, uid, isCurrentlySaved) {
  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, {
    savedBy: isCurrentlySaved ? arrayRemove(uid) : arrayUnion(uid),
  });
}

// ---- Track a view: +1 total, +1 in today's bucket of viewLog ----
export async function trackView(id) {
  const ref = doc(db, COLLECTION_NAME, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const log = Array.isArray(data.viewLog) ? [...data.viewLog] : [];
  const today = todayKey();
  const idx = log.findIndex((entry) => entry.date === today);

  if (idx >= 0) {
    log[idx] = { date: today, count: (log[idx].count || 0) + 1 };
  } else {
    log.push({ date: today, count: 1 });
  }
  // keep only the last 60 days so the doc doesn't grow forever
  const trimmedLog = log.slice(-60);

  await updateDoc(ref, {
    views: increment(1),
    viewLog: trimmedLog,
  });

  await bumpSiteAnalytics({
    totalViews: increment(1),
    [`categories.${data.category || "General"}.views`]: increment(1),
  });
}

// ---- Track watch time in seconds (call periodically e.g. every 15s while playing) ----
export async function trackWatchTime(id, secondsToAdd) {
  if (!secondsToAdd || secondsToAdd <= 0) return;
  const ref = doc(db, COLLECTION_NAME, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const log = Array.isArray(data.watchLog) ? [...data.watchLog] : [];
  const today = todayKey();
  const idx = log.findIndex((entry) => entry.date === today);

  if (idx >= 0) {
    log[idx] = { date: today, seconds: (log[idx].seconds || 0) + secondsToAdd };
  } else {
    log.push({ date: today, seconds: secondsToAdd });
  }
  const trimmedLog = log.slice(-60);

  await updateDoc(ref, {
    watchTimeSeconds: increment(secondsToAdd),
    watchLog: trimmedLog,
  });
}

// ---- Likes ----
export async function toggleLike(id, uid, isCurrentlyLiked, category) {
  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, {
    likes: isCurrentlyLiked ? arrayRemove(uid) : arrayUnion(uid),
  });

  const delta = isCurrentlyLiked ? -1 : 1;
  await bumpSiteAnalytics({
    totalLikes: increment(delta),
    [`categories.${category || "General"}.likes`]: increment(delta),
  });
}

// ---- Comments ----
export async function addComment(id, comment) {
  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, {
    comments: arrayUnion({
      ...comment,
      createdAt: new Date().toISOString(),
    }),
  });
}
