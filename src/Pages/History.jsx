import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/UserContext";
import { useWatchHistory } from "../CustomHooks/useWatchHistory";

function History() {
  const { User } = useContext(AuthContext);
  const { entries, loading } = useWatchHistory(User?.uid);

  return (
    <div className="pt-24 px-4 sm:px-10 pb-16 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-white text-3xl font-bold mb-8">Watch History</h1>

      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-neutral-400">
          Nothing watched yet. Videos you open will show up here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((e, idx) => (
            <Link
              key={`${e.videoId}-${idx}`}
              to={`/watch/${e.videoId}`}
              className="flex items-center gap-4 bg-neutral-900 hover:bg-neutral-800 transition rounded-md p-3"
            >
              <img
                src={e.thumbnailUrl}
                alt={e.title}
                className="w-32 h-18 object-cover rounded"
                onError={(ev) => {
                  ev.target.onerror = null;
                  ev.target.src =
                    "https://placehold.co/400x225/1a1a1a/eab308?text=MindTurn";
                }}
              />
              <div className="flex-1">
                <p className="text-white font-medium line-clamp-1">{e.title}</p>
                <p className="text-neutral-400 text-xs mt-1">
                  {new Date(e.watchedAt).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
