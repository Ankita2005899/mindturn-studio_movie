import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../componets/Header/Navbar";
import Footer from "../componets/Footer/Footer";
import { useAllSeries } from "../CustomHooks/useSeries";
import { useAllCustomVideos } from "../CustomHooks/useCustomVideos";

function SeriesWatch() {
  const { id } = useParams();
  const { series, loading: seriesLoading } = useAllSeries();
  const { videos, loading: videosLoading } = useAllCustomVideos();

  const thisSeries = series.find((s) => s.id === id);
  const loading = seriesLoading || videosLoading;

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar playPage />
        <div className="pt-24 text-white text-center">Loading…</div>
      </div>
    );
  }

  if (!thisSeries) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar playPage />
        <div className="pt-24 text-white text-center">
          Series not found.{" "}
          <Link to="/" className="text-red-500 underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const episodes = (thisSeries.videoIds || [])
    .map((vid) => videos.find((v) => v.id === vid))
    .filter(Boolean);

  return (
    <div className="bg-black min-h-screen">
      <Navbar playPage />

      <div className="pt-24 px-4 sm:px-10 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <img
            src={thisSeries.thumbnailUrl}
            alt={thisSeries.title}
            className="w-40 h-24 object-cover rounded-md border-b-4 border-yellow-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/400x225/1a1a1a/eab308?text=MindTurn";
            }}
          />
          <div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold">
              {thisSeries.title}
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              {episodes.length} episode{episodes.length !== 1 && "s"}
            </p>
          </div>
        </div>

        {thisSeries.description && (
          <p className="text-neutral-300 mb-8">{thisSeries.description}</p>
        )}

        <div className="flex flex-col gap-3">
          {episodes.map((ep, idx) => (
            <Link
              key={ep.id}
              to={`/watch/${ep.id}`}
              className="flex items-center gap-4 bg-neutral-900 hover:bg-neutral-800 transition rounded-md p-3"
            >
              <span className="text-neutral-500 w-6 text-center font-semibold">
                {idx + 1}
              </span>
              <img
                src={ep.thumbnailUrl}
                alt={ep.title}
                className="w-32 h-18 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/400x225/1a1a1a/eab308?text=MindTurn";
                }}
              />
              <div className="flex-1">
                <p className="text-white font-medium line-clamp-1">{ep.title}</p>
                <p className="text-neutral-400 text-xs mt-1">
                  {ep.views || 0} views
                </p>
              </div>
              <span className="text-yellow-700 text-xl">▶</span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SeriesWatch;
