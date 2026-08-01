import React from "react";
import { Link } from "react-router-dom";
import { useAllCustomVideos } from "../../CustomHooks/useCustomVideos";

function MindTurnOriginalsRow() {
  const { videos, loading } = useAllCustomVideos();

  if (loading || videos.length === 0) return null;

  return (
    <div className="ml-2 lg:ml-11 mb-11 lg:mb-4">
      <h1 className="text-white pb-4 xl:pb-0 font-normal text-base sm:text-2xl md:text-4xl">
        MindTurn Originals
      </h1>
      <div className="flex gap-3 overflow-visible pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {videos.map((v) => (
          <Link
            key={v.id}
            to={`/watch/${v.id}`}
            className="shrink-0 w-64 group relative"
          >
            <div className="relative rounded-sm overflow-visible">
              <img
                src={v.thumbnailUrl}
                alt={v.title}
                className="w-full h-36 object-cover border-b-4 border-yellow-700 rounded-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/400x225/1a1a1a/eab308?text=MindTurn";
                }}
              />

              {/* Hover popup */}
              <div className="hidden group-hover:block absolute -top-4 left-0 right-0 z-20 bg-[#181818] rounded-md shadow-2xl border border-neutral-700 p-3 scale-105 transition-all">
                <img
                  src={v.thumbnailUrl}
                  alt={v.title}
                  className="w-full h-28 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/400x225/1a1a1a/eab308?text=MindTurn";
                  }}
                />
                <p className="text-white text-sm font-semibold mt-2 line-clamp-1">
                  {v.title}
                </p>
                <p className="text-neutral-400 text-xs mt-1 line-clamp-2">
                  {v.description || "No description available."}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-full">
                    ▶ Play Now
                  </span>
                  <span className="text-neutral-400 text-xs">
                    {v.views || 0} views
                  </span>
                </div>
              </div>
            </div>
            <p className="text-white text-sm font-medium mt-2 line-clamp-1">
              {v.title}
            </p>
            <p className="text-neutral-400 text-xs">{v.views || 0} views</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MindTurnOriginalsRow;
