import React from "react";
import { Link } from "react-router-dom";
import Footer from "../componets/Footer/Footer";
import { useAllSeries } from "../CustomHooks/useSeries";

function Series() {
  const { series, loading } = useAllSeries();

  return (
    <div className="min-h-screen">
      <div className="pt-24 px-4 sm:px-10 pb-16 max-w-6xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">Series</h1>

        {loading ? (
          <p className="text-neutral-400">Loading…</p>
        ) : series.length === 0 ? (
          <p className="text-neutral-400">
            No series created yet. Go to{" "}
            <span className="text-yellow-600">Studio → Library / Series</span>{" "}
            to group your uploaded videos into a series.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {series.map((s) => (
              <Link key={s.id} to={`/originals-series/${s.id}`} className="group">
                <div className="relative rounded-md overflow-hidden">
                  <img
                    src={s.thumbnailUrl}
                    alt={s.title}
                    className="w-full h-40 object-cover border-b-4 border-yellow-700 group-hover:opacity-80 transition"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/400x225/1a1a1a/eab308?text=MindTurn";
                    }}
                  />
                  <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {s.videoIds?.length || 0} episodes
                  </span>
                </div>
                <p className="text-white text-sm font-medium mt-2 line-clamp-1">
                  {s.title}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Series;
