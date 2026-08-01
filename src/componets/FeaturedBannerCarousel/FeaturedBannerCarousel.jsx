import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Fade } from "react-reveal";
import { useFeaturedBanner } from "../../CustomHooks/useFeaturedBanner";
import { useAllCustomVideos } from "../../CustomHooks/useCustomVideos";

const SLIDE_DURATION_MS = 5000;

function FeaturedBannerCarousel() {
  const { slides: curatedSlides, loading: curatedLoading } = useFeaturedBanner();
  const { videos, loading: videosLoading } = useAllCustomVideos();
  const [activeIndex, setActiveIndex] = useState(0);

  const loading = curatedLoading || videosLoading;

  // Prefer slides the admin explicitly picked in /studio/featured.
  // If none set yet, auto-build the banner from the latest uploaded videos
  // (so newly uploaded content shows up here immediately, with no extra step).
  const slides = useMemo(() => {
    if (curatedSlides.length > 0) return curatedSlides;
    return videos.slice(0, 6).map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      imageUrl: v.thumbnailUrl,
      linkVideoId: v.id,
    }));
  }, [curatedSlides, videos]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="h-[50rem] md:h-[55rem] 3xl:h-[63rem] bg-neutral-950 animate-pulse" />
    );
  }

  // No admin slides AND no uploaded videos yet
  if (slides.length === 0) {
    return (
      <div className="h-[30rem] md:h-[35rem] bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500 text-lg text-center px-4">
          Upload a video from Studio, or add slides in{" "}
          <Link to="/studio/featured" className="text-yellow-600 underline">
            /studio/featured
          </Link>
          , to fill this banner.
        </p>
      </div>
    );
  }

  const slide = slides[Math.min(activeIndex, slides.length - 1)];

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(90deg, hsl(0deg 0% 7% / 91%) 0%, hsl(0deg 0% 0% / 0%) 35%, hsl(220deg 26% 44% / 0%) 100%), url(${slide.imageUrl})`,
      }}
      className="h-[50rem] md:h-[55rem] 3xl:h-[63rem] bg-cover bg-center object-contain grid items-center transition-all duration-700"
    >
      <div className="ml-2 mr-2 sm:mr-0 sm:ml-12 mt-[75%] sm:mt-52">
        <Fade bottom key={slide.id}>
          <h1 className="text-white text-3xl font-semibold text-center mb-5 py-2 sm:text-left sm:text-5xl sm:border-l-8 pl-4 border-yellow-700 md:text-6xl lg:w-2/3 xl:w-1/2 sm:font-bold drop-shadow-lg">
            {slide.title}
          </h1>

          {slide.description && (
            <h1 className="text-white text-xl drop-shadow-xl text-center line-clamp-2 sm:line-clamp-3 sm:text-left w-full md:w-4/5 lg:w-8/12/2 lg:text-xl xl:w-5/12 2xl:text-2xl mb-4">
              {slide.description}
            </h1>
          )}

          <div className="flex justify-center sm:justify-start">
            {slide.linkVideoId && (
              <Link
                to={`/watch/${slide.linkVideoId}`}
                className="bg-yellow-800 hover:bg-yellow-900 transition duration-500 ease-in-out shadow-2xl flex items-center mb-3 mr-3 text-base sm:text-xl font-semibold text-white py-2 sm:py-2 px-10 sm:px-14 rounded-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
                Play
              </Link>
            )}
          </div>
        </Fade>

        {/* Slide indicator dots */}
        {slides.length > 1 && (
          <div className="flex gap-2 mt-6 justify-center sm:justify-start">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-8 bg-yellow-700" : "w-3 bg-white/40"
                }`}
                aria-label={`Show slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeaturedBannerCarousel;
