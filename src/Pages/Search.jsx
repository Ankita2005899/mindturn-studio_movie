import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAllCustomVideos } from "../CustomHooks/useCustomVideos";

function Search() {
  const { videos, loading } = useAllCustomVideos();
  const [searchQuery, setSearchQuery] = useState("");

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return videos.filter(
      (v) =>
        v.title?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q)
    );
  }, [videos, searchQuery]);

  return (
    <div className="min-h-screen">
      <div className="pt-24 px-4 sm:px-10 pb-16 max-w-6xl mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search videos by title, description, or category…"
          className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-md px-5 py-3 text-lg focus:outline-none focus:border-yellow-700"
        />

        {loading ? (
          <p className="text-neutral-400 mt-8">Loading…</p>
        ) : !searchQuery.trim() ? (
          <p className="text-neutral-500 mt-8">Start typing to search.</p>
        ) : results.length === 0 ? (
          <p className="text-neutral-500 mt-8">No videos match "{searchQuery}".</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-8">
            {results.map((v) => (
              <Link key={v.id} to={`/watch/${v.id}`} className="group">
                <img
                  src={v.thumbnailUrl}
                  alt={v.title}
                  className="w-full h-36 object-cover rounded-md border-b-4 border-yellow-700 group-hover:opacity-80 transition"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/400x225/1a1a1a/eab308?text=MindTurn";
                  }}
                />
                <p className="text-white text-sm font-medium mt-2 line-clamp-1">
                  {v.title}
                </p>
                <p className="text-neutral-400 text-xs">{v.views || 0} views</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
