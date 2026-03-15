import React, { useEffect, useState } from "react";
import { getAllVideos } from "../api/videoAPI";
import VideoCard from "../components/video/VideoCard";

const SkeletonCard = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="w-full aspect-video bg-[#272727] rounded-xl" />
    <div className="flex gap-3 px-1">
      <div className="w-9 h-9 rounded-full bg-[#272727] shrink-0 mt-0.5" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3.5 bg-[#272727] rounded w-full" />
        <div className="h-3 bg-[#272727] rounded w-2/3" />
        <div className="h-3 bg-[#272727] rounded w-1/2" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [videos, setVideos] = useState([]); //  always an array
  const [loading, setLoading] = useState(true); // start as true

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await getAllVideos();
      //    console.log("Full response:", res);
      // console.log("res.data:", res.data);
      // console.log("res.data.videos:", res.data?.videos);

      // res = { statusCode, data: { videos, totalVideos, page, limit }, message }
      setVideos(data.videos || []); // correct path + safe fallback
    } catch (error) {
      console.error("fetchVideos error:", error);
      setVideos([]); // never leave videos undefined on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        ) : videos.length > 0 ? (
          videos.map((video) => <VideoCard key={video._id} video={video} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            </div>
            <p className="text-white text-base font-medium">No videos yet</p>
            <p className="text-[#aaa] text-sm">
              Videos you upload will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
