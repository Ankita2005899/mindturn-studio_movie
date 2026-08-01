import React from "react";
import { Link } from "react-router-dom";
import { useAllSeries } from "../../CustomHooks/useSeries";

function MindTurnSeriesRow() {
  const { series, loading } = useAllSeries();

  if (loading || series.length === 0) return null;

  return (
    <div className="ml-2 lg:ml-11 mb-11 lg:mb-4">
      <h1 className="text-white pb-4 xl:pb-0 font-normal text-base sm:text-2xl md:text-4xl">
        MindTurn Series
      </h1>
      <div className="flex gap-3 overflow-x-auto pt-4 pb-2 scrollbar-hide">
        {series.map((s) => (
          <Link
            key={s.id}
            to={`/originals-series/${s.id}`}
            className="shrink-0 w-64 group"
          >
            <div className="relative rounded-sm overflow-hidden">
              <img
                src={s.thumbnailUrl}
                alt={s.title}
                className="w-full h-36 object-cover border-b-4 border-yellow-700 rounded-sm group-hover:opacity-80 transition"
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
    </div>
  );
}

export default MindTurnSeriesRow;
