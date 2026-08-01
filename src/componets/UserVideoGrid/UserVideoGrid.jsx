import React from "react";
import { Link } from "react-router-dom";

function UserVideoGrid({ title, videos, loading, emptyMessage }) {
  return (
    <div className="pt-24 px-4 sm:px-10 pb-16 max-w-6xl mx-auto min-h-screen">
      <h1 className="text-white text-3xl font-bold mb-8">{title}</h1>

      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : videos.length === 0 ? (
        <p className="text-neutral-400">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {videos.map((v) => (
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserVideoGrid;
