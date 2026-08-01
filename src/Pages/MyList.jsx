import React, { useContext } from "react";
import { AuthContext } from "../Context/UserContext";
import { useVideosByField } from "../CustomHooks/useCustomVideos";
import UserVideoGrid from "../componets/UserVideoGrid/UserVideoGrid";

function MyList() {
  const { User } = useContext(AuthContext);
  const { videos, loading } = useVideosByField("savedBy", User?.uid);

  return (
    <UserVideoGrid
      title="My List"
      videos={videos}
      loading={loading}
      emptyMessage='Nothing saved yet. Tap "+ My List" on any video to save it for later.'
    />
  );
}

export default MyList;
