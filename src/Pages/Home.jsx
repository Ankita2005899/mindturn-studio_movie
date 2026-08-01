import React from "react";
import FeaturedBannerCarousel from "../componets/FeaturedBannerCarousel/FeaturedBannerCarousel";
import Footer from "../componets/Footer/Footer";
import MindTurnOriginalsRow from "../componets/MindTurnOriginalsRow/MindTurnOriginalsRow";
import MindTurnSeriesRow from "../componets/MindTurnSeriesRow/MindTurnSeriesRow";

function Home() {
  return (
    <div>
      <FeaturedBannerCarousel />
      <div className="w-[99%] ml-1">
        <MindTurnOriginalsRow />
        <MindTurnSeriesRow />
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Home;
