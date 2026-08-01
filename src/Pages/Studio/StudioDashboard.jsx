import React, { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/UserContext";
import StudioSidebar from "./StudioSidebar";
import { useAllCustomVideos } from "../../CustomHooks/useCustomVideos";

function formatWatchHours(seconds) {
  return (seconds / 3600).toFixed(1);
}

function StudioDashboard() {
  const { User } = useContext(AuthContext);
  const { videos, loading } = useAllCustomVideos();
  const navigate = useNavigate();

  const latestVideo = videos[0];

  const totals = useMemo(() => {
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
    const totalWatchSeconds = videos.reduce(
      (sum, v) => sum + (v.watchTimeSeconds || 0),
      0
    );
    const totalLikes = videos.reduce(
      (sum, v) => sum + (v.likes?.length || 0),
      0
    );
    return { totalViews, totalWatchSeconds, totalLikes };
  }, [videos]);

  const topContent = useMemo(() => {
    return [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  }, [videos]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <StudioSidebar />

      <div className="flex-1 p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Channel dashboard</h1>
          <button
            onClick={() => navigate("/studio/upload")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-full"
          >
            <span>⬆</span> Create / Upload
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading your channel data…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest video performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">
                Latest video performance
              </h2>
              {latestVideo ? (
                <>
                  <Link to={`/watch/${latestVideo.id}`}>
                    <div className="relative rounded-lg overflow-hidden mb-3">
                      <img
                        src={latestVideo.thumbnailUrl}
                        alt={latestVideo.title}
                        className="w-full h-40 object-cover"
                      />
                      <p className="absolute bottom-2 left-2 right-2 text-white font-medium text-sm bg-black/40 rounded px-2 py-1 line-clamp-2">
                        {latestVideo.title}
                      </p>
                    </div>
                  </Link>
                  <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                    <span>👁 {latestVideo.views || 0} views</span>
                    <span>👍 {latestVideo.likes?.length || 0} likes</span>
                    <span>💬 {latestVideo.comments?.length || 0} comments</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">
                  No videos uploaded yet.{" "}
                  <Link to="/studio/upload" className="text-red-600 underline">
                    Upload your first one
                  </Link>
                </p>
              )}
            </div>

            {/* Channel analytics summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-1">Channel analytics</h2>
              <p className="text-xs text-gray-400 mb-4">All-time summary</p>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500 text-sm">Views</span>
                <span className="font-semibold text-gray-900">
                  {totals.totalViews}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500 text-sm">Watch time (hours)</span>
                <span className="font-semibold text-gray-900">
                  {formatWatchHours(totals.totalWatchSeconds)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 mb-4">
                <span className="text-gray-500 text-sm">Total likes</span>
                <span className="font-semibold text-gray-900">
                  {totals.totalLikes}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-2">Top content · Views</p>
              {topContent.length === 0 ? (
                <p className="text-gray-400 text-sm">Nothing uploaded yet.</p>
              ) : (
                topContent.map((v) => (
                  <div
                    key={v.id}
                    className="flex justify-between text-sm py-1.5 text-gray-700"
                  >
                    <span className="truncate pr-2">{v.title}</span>
                    <span className="text-gray-500 shrink-0">{v.views || 0}</span>
                  </div>
                ))
              )}

              <button
                onClick={() => navigate("/studio/analytics")}
                className="mt-5 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2.5 rounded-full"
              >
                Go to channel analytics
              </button>
            </div>

            {/* Quick links / info panel */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/studio/upload")}
                  className="text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-800"
                >
                  ⬆ Upload a new video
                </button>
                <button
                  onClick={() => navigate("/studio/content")}
                  className="text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-800"
                >
                  ▶ Manage all uploaded videos
                </button>
                <button
                  onClick={() => navigate("/studio/analytics")}
                  className="text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-800"
                >
                  📊 View detailed analytics
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-6">
                Signed in as {User?.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudioDashboard;
