import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { getAllVideos } from "../api/videoAPI";

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

const SearchSkeleton = () => (
  <div className="flex flex-col sm:flex-row gap-4 animate-pulse">
    <div className="w-full sm:w-64 md:w-72 aspect-video bg-[#272727] rounded-xl shrink-0" />
    <div className="flex flex-col gap-2 flex-1 pt-1">
      <div className="h-5 bg-[#272727] rounded w-3/4" />
      <div className="h-3.5 bg-[#272727] rounded w-1/4" />
      <div className="h-3.5 bg-[#272727] rounded w-full mt-2" />
      <div className="h-3.5 bg-[#272727] rounded w-2/3" />
    </div>
  </div>
);

const FilterBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap
      ${
        active
          ? "bg-white text-black"
          : "bg-[#272727] text-white hover:bg-[#3d3d3d]"
      }`}
  >
    {children}
  </button>
);

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  // Local input state for the search bar on this page
  const [inputValue, setInputValue] = useState(query);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");

  const LIMIT = 10;

  //  Sync input value when URL query changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSearchParams({ q: inputValue.trim() });
  };

  const fetchVideos = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await getAllVideos({
        query,
        sortBy,
        sortType,
        page: pageNum,
        limit: LIMIT,
      });

      const list = data?.videos || [];
      setTotalVideos(data?.totalVideos || 0);
      setVideos((prev) => (append ? [...prev, ...list] : list));
      setHasMore(list.length === LIMIT);
    } catch (err) {
      console.error("search error:", err);
      setVideos([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setVideos([]);
    if (query.trim()) fetchVideos(1);
    else setVideos([]);
  }, [query, sortBy, sortType]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setPage(next);
    await fetchVideos(next, true);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) return;
    setSortBy(newSortBy);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Search bar — visible on all screens */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
          <div className="flex flex-1 border border-[#303030] rounded-l-full bg-[#121212] focus-within:border-[#1c62b9] overflow-hidden">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search videos..."
              className="flex-1 px-4 py-2.5 bg-transparent text-white text-sm outline-none placeholder-[#aaa]"
            />
            {/*  Clear button */}
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  setSearchParams({});
                }}
                className="px-3 text-[#aaa] hover:text-white transition"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#222] border border-[#303030] border-l-0 rounded-r-full hover:bg-[#3d3d3d] transition flex items-center justify-center shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </form>

        {/* No query state */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <p className="text-white font-medium">Search for videos</p>
            <p className="text-[#aaa] text-sm">
              Enter a keyword above to search
            </p>
          </div>
        )}

        {query && (
          <>
            {/* Result count */}
            {!loading && (
              <p className="text-[#aaa] text-sm mb-4">
                {totalVideos > 0
                  ? `${totalVideos} result${totalVideos !== 1 ? "s" : ""} for `
                  : "No results for "}
                <span className="text-white font-medium">"{query}"</span>
              </p>
            )}

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[#aaa] text-sm shrink-0">Sort by:</span>
              <FilterBtn
                active={sortBy === "createdAt"}
                onClick={() => handleSortChange("createdAt")}
              >
                Latest
              </FilterBtn>
              <FilterBtn
                active={sortBy === "views"}
                onClick={() => handleSortChange("views")}
              >
                Most viewed
              </FilterBtn>
              <FilterBtn
                active={sortBy === "title"}
                onClick={() => handleSortChange("title")}
              >
                Title
              </FilterBtn>
              <button
                onClick={() =>
                  setSortType((prev) => (prev === "desc" ? "asc" : "desc"))
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm rounded-full transition ml-1 shrink-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`transition-transform ${sortType === "asc" ? "rotate-180" : ""}`}
                >
                  <path d="M7 14l5-5 5 5z" />
                </svg>
                {sortType === "desc" ? "Newest first" : "Oldest first"}
              </button>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex flex-col gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SearchSkeleton key={i} />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
                <p className="text-white text-base font-medium">
                  No videos found
                </p>
                <p className="text-[#aaa] text-sm">
                  Try different keywords or check the spelling
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {videos.map((video) => (
                  <Link
                    key={video._id}
                    to={`/video/${video._id}`}
                    className="flex flex-col sm:flex-row gap-4 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-64 md:w-72 aspect-video bg-[#272727] rounded-xl overflow-hidden shrink-0">
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
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <h2 className="text-white text-base font-medium line-clamp-2 leading-snug group-hover:text-[#aaa] transition">
                        {video.title}
                      </h2>
                      <p className="text-[#aaa] text-xs">
                        {formatViews(video.views)} views ·{" "}
                        {formatDate(video.createdAt)}
                      </p>
                      <Link
                        to={`/channel/${video.owner?.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 w-fit"
                      >
                        {video.owner?.avatar ? (
                          <img
                            src={video.owner.avatar}
                            alt={video.owner.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#272727] flex items-center justify-center text-[10px] font-semibold uppercase text-white">
                            {video.owner?.username?.slice(0, 2)}
                          </div>
                        )}
                        <span className="text-[#aaa] text-xs hover:text-white transition">
                          {video.owner?.username}
                        </span>
                      </Link>
                      {video.description && (
                        <p className="text-[#aaa] text-xs line-clamp-2 leading-relaxed hidden sm:block">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && !loading && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-2.5 bg-[#272727] hover:bg-[#3d3d3d] disabled:opacity-50 text-white text-sm font-medium rounded-full transition flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    "Load more results"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
