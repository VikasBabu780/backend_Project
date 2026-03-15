import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWatchHistory } from "../api/authAPI";

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

const formatDuration = (seconds) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ─── Skeleton ─────────────
const SkeletonRow = () => (
  <div className="flex flex-col sm:flex-row gap-4 animate-pulse">
    <div className="w-full sm:w-48 md:w-56 aspect-video bg-[#272727] rounded-xl shrink-0" />
    <div className="flex flex-col gap-2 flex-1 pt-1">
      <div className="h-4 bg-[#272727] rounded w-3/4" />
      <div className="h-3 bg-[#272727] rounded w-1/4" />
      <div className="h-3 bg-[#272727] rounded w-1/2 mt-1" />
      <div className="h-3 bg-[#272727] rounded w-1/3" />
    </div>
  </div>
);

// ─── Main WatchHistory Page ─────────────
const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getWatchHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchHistory error:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Client-side search filter
  const filtered = history.filter(
    (video) =>
      video.title?.toLowerCase().includes(search.toLowerCase()) ||
      video.owner?.username?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#aaa">
                <path d="M13 3a9 9 0 1 0 0 18A9 9 0 0 0 13 3zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm.5-11H12v6l5.25 3.15.75-1.23-4.5-2.67V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">
                Watch History
              </h1>
              {!loading && (
                <p className="text-[#aaa] text-sm mt-0.5">
                  {filtered.length} video{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Search within history */}
          {!loading && history.length > 0 && (
            <div className="relative w-full sm:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-[#1a1a1a] border border-[#303030] text-white text-sm rounded-full pl-9 pr-4 py-2 outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-white transition"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : history.length === 0 ? (
          // Empty state — no history at all
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                <path d="M13 3a9 9 0 1 0 0 18A9 9 0 0 0 13 3zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm.5-11H12v6l5.25 3.15.75-1.23-4.5-2.67V8z" />
              </svg>
            </div>
            <p className="text-white text-base font-medium">No watch history</p>
            <p className="text-[#aaa] text-sm">
              Videos you watch will appear here
            </p>
            <Link
              to="/"
              className="mt-2 px-5 py-2 bg-[#1c62b9] hover:bg-[#1a56a0] text-white text-sm font-medium rounded-full transition"
            >
              Browse videos
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          // Empty state — search returned nothing
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <p className="text-white text-base font-medium">No results found</p>
            <p className="text-[#aaa] text-sm">
              No videos match <span className="text-white">"{search}"</span>
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-2 px-5 py-2 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-full transition"
            >
              Clear search
            </button>
          </div>
        ) : (
          // Video list
          <div className="flex flex-col gap-5">
            {filtered.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 group"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-48 md:w-56 aspect-video bg-[#272727] rounded-xl overflow-hidden shrink-0">
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
                  {/* Duration badge */}
                  {video.duration && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5 min-w-0 flex-1 sm:pt-0.5">
                  <h3 className="text-white text-sm sm:text-base font-medium line-clamp-2 leading-snug group-hover:text-[#aaa] transition">
                    {video.title}
                  </h3>

                  {/* Channel */}
                  <Link
                    to={`/channel/${video.owner?.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 w-fit"
                  >
                    {video.owner?.avatar ? (
                      <img
                        src={video.owner.avatar}
                        alt={video.owner.username}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#272727] flex items-center justify-center text-[9px] font-semibold uppercase text-white">
                        {video.owner?.username?.slice(0, 2)}
                      </div>
                    )}
                    <span className="text-[#aaa] text-xs hover:text-white transition">
                      {video.owner?.username}
                    </span>
                  </Link>

                  <p className="text-[#aaa] text-xs">
                    {formatViews(video.views || 0)} views ·{" "}
                    {formatDate(video.createdAt)}
                  </p>

                  {/* Description */}
                  {video.description && (
                    <p className="text-[#aaa] text-xs line-clamp-2 leading-relaxed hidden sm:block mt-0.5">
                      {video.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchHistory;
