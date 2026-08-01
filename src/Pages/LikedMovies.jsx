import React, { useContext } from "react";
import { AuthContext } from "../Context/UserContext";
import { useVideosByField } from "../CustomHooks/useCustomVideos";
import UserVideoGrid from "../componets/UserVideoGrid/UserVideoGrid";

function LikedMovies() {
  const { User } = useContext(AuthContext);
  const { videos, loading } = useVideosByField("likes", User?.uid);

  return (
    <UserVideoGrid
      title="Liked Videos"
      videos={videos}
      loading={loading}
      emptyMessage="You haven't liked anything yet. Tap Like on any video to see it here."
    />
  );
}

export default LikedMovies;
