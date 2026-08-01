import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import YouTube from "react-youtube";
import Navbar from "../componets/Header/Navbar";
import Footer from "../componets/Footer/Footer";
import { AuthContext } from "../Context/UserContext";
import {
  useCustomVideo,
  trackView,
  trackWatchTime,
  toggleLike,
  toggleSaveToList,
  addComment,
} from "../CustomHooks/useCustomVideos";
import { useAllSeries } from "../CustomHooks/useSeries";
import { addToHistory } from "../CustomHooks/useWatchHistory";
import toast, { Toaster } from "react-hot-toast";

const WATCH_TICK_SECONDS = 15;

function WatchCustom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { User } = useContext(AuthContext);
  const { video, loading } = useCustomVideo(id);
  const { series } = useAllSeries();

  // Is this video part of a series? If so, what's the next episode?
  const parentSeries = series.find((s) => (s.videoIds || []).includes(id));
  const nextEpisodeId = (() => {
    if (!parentSeries) return null;
    const idx = parentSeries.videoIds.indexOf(id);
    return parentSeries.videoIds[idx + 1] || null;
  })();

  const [commentText, setCommentText] = useState("");
  const hasTrackedView = useRef(false);
  const isPlayingRef = useRef(false);

  // Track a view once when the video loads
  useEffect(() => {
    if (id && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackView(id);
    }
  }, [id]);

  // Record this in the user's watch history
  useEffect(() => {
    if (User?.uid && video) {
      addToHistory(User.uid, video);
    }
  }, [User?.uid, video?.id]);

  // Every 15s while the video is playing, log watch time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlayingRef.current) {
        trackWatchTime(id, WATCH_TICK_SECONDS);
      }
    }, WATCH_TICK_SECONDS * 1000);
    return () => clearInterval(interval);
  }, [id]);

  const opts = {
    width: "100%",
    height: "100%",
    playerVars: { autoplay: 1 },
  };

  const goToNextEpisode = () => {
    if (!nextEpisodeId) return;
    toast.success("Playing next episode…");
    setTimeout(() => navigate(`/watch/${nextEpisodeId}`), 1500);
  };

  const handleStateChange = (event) => {
    // 1 = playing, 2 = paused, 0 = ended
    isPlayingRef.current = event.data === 1;
    if (event.data === 0) {
      goToNextEpisode();
    }
  };

  const handleHtml5Play = () => {
    isPlayingRef.current = true;
  };

  const handleHtml5Pause = () => {
    isPlayingRef.current = false;
  };

  const handleHtml5Ended = () => {
    isPlayingRef.current = false;
    goToNextEpisode();
  };

  const isLiked = video?.likes?.includes(User?.uid);
  const isSaved = video?.savedBy?.includes(User?.uid);

  const handleLike = () => {
    if (!User) return;
    toggleLike(id, User.uid, isLiked, video.category);
  };

  const handleSave = () => {
    if (!User) return;
    toggleSaveToList(id, User.uid, isSaved);
    toast.success(isSaved ? "Removed from My List" : "Added to My List");
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !User) return;
    addComment(id, {
      uid: User.uid,
      name: User.displayName || "MindTurn viewer",
      text: commentText.trim(),
    });
    setCommentText("");
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar playPage />
        <div className="pt-24 text-white text-center">Loading…</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar playPage />
        <div className="pt-24 text-white text-center">
          Video not found.{" "}
          <Link to="/" className="text-red-500 underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <Toaster />
      <Navbar playPage />

      <div className="mt-14 h-[31vh] sm:h-[42vh] md:h-[45vh] lg:h-[55vh] xl:h-[80vh]">
        {video.videoType === "upload" && video.videoUrl ? (
          <video
            src={video.videoUrl}
            controls
            autoPlay
            onPlay={handleHtml5Play}
            onPause={handleHtml5Pause}
            onEnded={handleHtml5Ended}
            className="w-full h-full bg-black"
          />
        ) : (
          <YouTube
            videoId={video.youtubeId}
            opts={opts}
            onStateChange={handleStateChange}
            className="w-full h-full"
          />
        )}
      </div>

      <div className="px-4 sm:px-10 py-8 max-w-4xl mx-auto">
        {parentSeries && (
          <p className="text-yellow-600 text-sm font-medium mb-2">
            <Link to={`/originals-series/${parentSeries.id}`} className="hover:underline">
              {parentSeries.title}
            </Link>
            {" · Episode "}
            {parentSeries.videoIds.indexOf(id) + 1} of {parentSeries.videoIds.length}
            {nextEpisodeId && " · next episode plays automatically"}
          </p>
        )}
        <h1 className="text-white text-2xl sm:text-3xl font-bold">{video.title}</h1>
        <div className="flex items-center gap-4 text-neutral-400 text-sm mt-2">
          <span>{video.views || 0} views</span>
          <span>·</span>
          <span>{video.category}</span>
          <span>·</span>
          <span>
            {video.createdAt
              ? new Date(video.createdAt).toLocaleDateString()
              : ""}
          </span>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleLike}
            disabled={!User}
            className={`flex items-center gap-2 border-2 rounded-full px-5 py-2 text-sm font-medium transition ${
              isLiked
                ? "bg-white text-black border-white"
                : "text-white border-white hover:bg-white hover:text-black"
            }`}
          >
            👍 {isLiked ? "Liked" : "Like"} ({video.likes?.length || 0})
          </button>

          <button
            onClick={handleSave}
            disabled={!User}
            className={`flex items-center gap-2 border-2 rounded-full px-5 py-2 text-sm font-medium transition ${
              isSaved
                ? "bg-white text-black border-white"
                : "text-white border-white hover:bg-white hover:text-black"
            }`}
          >
            {isSaved ? "✓ In My List" : "+ My List"}
          </button>
        </div>

        <p className="text-neutral-300 mt-5 whitespace-pre-line">
          {video.description}
        </p>

        <div className="border-t border-neutral-800 mt-8 pt-6">
          <h2 className="text-white font-semibold text-lg mb-4">
            Comments ({video.comments?.length || 0})
          </h2>

          {User ? (
            <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 bg-transparent border-b border-neutral-700 text-white text-sm py-2 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="text-red-500 font-medium text-sm disabled:opacity-40"
                disabled={!commentText.trim()}
              >
                Post
              </button>
            </form>
          ) : (
            <p className="text-neutral-500 text-sm mb-6">
              <Link to="/signin" className="underline">
                Sign in
              </Link>{" "}
              to like or comment.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {(video.comments || [])
              .slice()
              .reverse()
              .map((c, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{c.name}</p>
                    <p className="text-neutral-400 text-sm">{c.text}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default WatchCustom;
