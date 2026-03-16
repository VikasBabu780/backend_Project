import { useEffect, useState, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getVideoById, getAllVideos } from "../api/videoAPI";
import { toggleVideoLike, getLikedVideos } from "../api/likeAPI";
import { toggleSubscription } from "../api/subscriptionAPI";
import { getUserChannelProfile } from "../api/authAPI";
import CommentSection from "../components/comments/commentSection";
import PlaylistModal from "../components/playlist/PlaylistModal";
import toast from "react-hot-toast";

const formatViews = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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

const SuggestedSkeleton = () => (
  <div className="flex gap-2 animate-pulse">
    <div className="w-40 aspect-video bg-[#272727] rounded-lg shrink-0" />
    <div className="flex flex-col gap-2 flex-1 pt-1">
      <div className="h-3 bg-[#272727] rounded w-full" />
      <div className="h-3 bg-[#272727] rounded w-3/4" />
      <div className="h-3 bg-[#272727] rounded w-1/2" />
    </div>
  </div>
);

const VideoPlayer = () => {
  const { videoId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestedLoading, setSuggestedLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false); // ✅ added

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
    navigate(-1);
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const video = await getVideoById(videoId);
        setVideo(video);

        if (video?.owner?.username) {
          const channelData = await getUserChannelProfile(video.owner.username);
          setChannel(channelData);
          setSubscribed(channelData?.isSubscribed || false);
        }

        if (user) {
          const likedList = await getLikedVideos();
          const likedIds = (likedList || []).map((l) =>
            l.video?._id?.toString(),
          );
          setLiked(likedIds.includes(videoId));
        }
      } catch (err) {
        console.error("fetchVideo error:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        setSuggestedLoading(true);
        const data = await getAllVideos({ limit: 10 });
        const videos = data?.videos || [];
        setSuggested(videos.filter((v) => v._id !== videoId));
      } catch (err) {
        console.error("fetchSuggested error:", err);
        setSuggested([]);
      } finally {
        setSuggestedLoading(false);
      }
    };

    fetchSuggested();
  }, [videoId]);

  const handleLike = async () => {
    if (!user) return navigate("/login");
    try {
      setLikeLoading(true);
      await toggleVideoLike(videoId);
      setLiked((prev) => !prev);
    } catch (err) {
      console.error("handleLike error:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return navigate("/login");
    try {
      setSubLoading(true);
      await toggleSubscription(video.owner._id);

      const newSubscribed = !subscribed;
      setSubscribed(newSubscribed);

      setChannel((prev) => ({
        ...prev,
        subscribersCount: newSubscribed
          ? (prev.subscribersCount || 0) + 1
          : (prev.subscribersCount || 0) - 1,
      }));
      toast.success(newSubscribed ? "Subscribed!" : "Unsubscribed");
    } catch (err) {
      toast.error(err.message || "Failed to update subscription");
      console.error("handleSubscribe error:", err);
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6">
          <div className="flex-1 animate-pulse">
            <div className="w-full aspect-video bg-[#272727] rounded-xl mb-4" />
            <div className="h-5 bg-[#272727] rounded w-3/4 mb-3" />
            <div className="h-4 bg-[#272727] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* LEFT — video + details */}
          <div className="flex-1 min-w-0">
            {/* Video player */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
              <video
                ref={videoRef}
                src={video.videoFile}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={video.thumbnail}
              />
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 cursor-pointer"
                title="Stop and go back"
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
            </div>

            {/* Title */}
            <h1 className="text-white text-base sm:text-lg font-semibold mt-3 leading-snug">
              {video.title}
            </h1>

            {/* Channel row + actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
              {/* Channel info */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link to={`/channel/${video.owner?.username}`}>
                  {video.owner?.avatar ? (
                    <img
                      src={video.owner.avatar}
                      alt={video.owner.username}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center text-sm font-semibold uppercase shrink-0">
                      {video.owner?.username?.slice(0, 2)}
                    </div>
                  )}
                </Link>

                <div>
                  <Link
                    to={`/channel/${video.owner?.username}`}
                    className="text-white text-sm font-medium hover:text-[#aaa] transition"
                  >
                    {video.owner?.username}
                  </Link>
                  <p className="text-[#aaa] text-xs">
                    {formatViews(channel?.subscribersCount || 0)} subscribers
                  </p>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={subLoading}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-60
    ${
      subscribed
        ? "bg-[#272727] text-white hover:bg-[#3d3d3d]"
        : "bg-white text-black hover:bg-gray-200"
    }`}
                >
                  {subLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin w-3.5 h-3.5"
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
                      {subscribed ? "Unsubscribing..." : "Subscribing..."}
                    </span>
                  ) : subscribed ? (
                    "Subscribed"
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-60
                    ${
                      liked
                        ? "bg-white text-black"
                        : "bg-[#272727] text-white hover:bg-[#3d3d3d]"
                    }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                  </svg>
                  {likeLoading ? "..." : liked ? "Liked" : "Like"}
                </button>

                <button
                  onClick={() =>
                    navigator.share?.({
                      title: video.title,
                      url: window.location.href,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272727] hover:bg-[#3d3d3d] text-sm font-medium transition"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                  </svg>
                  Share
                </button>

                {/* Save to playlist button */}
                <button
                  onClick={() =>
                    user ? setShowPlaylistModal(true) : navigate("/login")
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272727] hover:bg-[#3d3d3d] text-sm font-medium transition"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  Save
                </button>
              </div>
            </div>

            {/* Description box */}
            <div className="mt-4 bg-[#1a1a1a] rounded-xl p-4">
              <p className="text-sm text-[#aaa] mb-1">
                <span className="text-white font-medium">
                  {formatViews(video.views || 0)} views
                </span>
                {" · "}
                {formatDate(video.createdAt)}
              </p>
              <p
                className={`text-sm text-white whitespace-pre-line ${!showFullDesc ? "line-clamp-3" : ""}`}
              >
                {video.description}
              </p>
              {video.description?.length > 150 && (
                <button
                  onClick={() => setShowFullDesc((p) => !p)}
                  className="text-sm text-white font-medium mt-1 hover:text-[#aaa] transition"
                >
                  {showFullDesc ? "Show less" : "...more"}
                </button>
              )}
            </div>

            {/* Comments */}
            <div className="mt-6">
              <CommentSection videoId={videoId} />
            </div>
          </div>

          {/* RIGHT — suggested videos */}
          <div className="xl:w-95 shrink-0">
            <h2 className="text-white text-sm font-medium mb-3 hidden xl:block">
              Up next
            </h2>
            <div className="flex flex-col gap-3">
              {suggestedLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <SuggestedSkeleton key={i} />
                ))
              ) : suggested.length > 0 ? (
                suggested.map((v) => (
                  <Link
                    key={v._id}
                    to={`/video/${v._id}`}
                    className="flex gap-2 group"
                  >
                    <div className="relative w-40 sm:w-44 aspect-video bg-[#272727] rounded-lg overflow-hidden shrink-0">
                      {v.thumbnail ? (
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="#555"
                          >
                            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                          </svg>
                        </div>
                      )}
                      {v.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">
                          {formatDuration(v.duration)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
                      <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
                        {v.title}
                      </h3>
                      <p className="text-[#aaa] text-xs">{v.owner?.username}</p>
                      <p className="text-[#aaa] text-xs">
                        {formatViews(v.views || 0)} views
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-[#aaa] text-sm">No suggested videos</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Playlist modal */}
      {showPlaylistModal && (
        <PlaylistModal
          videoId={videoId}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
