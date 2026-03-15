import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLikedVideos } from "../api/likeAPI";

const formatViews = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v || 0;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Skeleton ──────────────
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

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        const data = await getLikedVideos();
        // data is array of { video: {...}, likedBy: ... }
        const list = (Array.isArray(data) ? data : [])
          .map((item) => item.video)
          .filter(Boolean);
        setVideos(list);
      } catch (err) {
        console.error("fetchLikedVideos error:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#aaa">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Liked Videos</h1>
            {!loading && (
              <p className="text-[#aaa] text-sm mt-0.5">
                {videos.length} video{videos.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : videos.length > 0 ? (
            videos.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="flex flex-col gap-2 group"
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-[#272727] rounded-xl overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="#555"
                      >
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex gap-3 px-0.5">
                  <Link
                    to={`/channel/${video.owner?.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 mt-0.5"
                  >
                    {video.owner?.avatar ? (
                      <img
                        src={video.owner.avatar}
                        alt={video.owner.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#272727] flex items-center justify-center text-xs font-semibold uppercase text-white">
                        {video.owner?.username?.slice(0, 2) || "YT"}
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    <Link
                      to={`/channel/${video.owner?.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#aaa] text-xs hover:text-white transition"
                    >
                      {video.owner?.username}
                    </Link>
                    <p className="text-[#aaa] text-xs">
                      {formatViews(video.views || 0)} views ·{" "}
                      {formatDate(video.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
              </div>
              <p className="text-white text-base font-medium">
                No liked videos yet
              </p>
              <p className="text-[#aaa] text-sm">
                Videos you like will appear here
              </p>
              <Link
                to="/"
                className="mt-2 px-5 py-2 bg-[#1c62b9] hover:bg-[#1a56a0] text-white text-sm font-medium rounded-full transition"
              >
                Browse videos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedVideos;
