import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserChannelProfile } from "../api/authAPI";
import { getAllVideos } from "../api/videoAPI";
import { toggleSubscription } from "../api/subscriptionAPI";
import { getUserPlaylists } from "../api/playlistAPI";
import TweetSection from "../components/tweets/TweetSection";
import toast from "react-hot-toast";

const formatViews = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v || 0;
};

const formatDate = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
};

const VideoSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="w-full aspect-video bg-[#272727] rounded-xl" />
    <div className="flex gap-3 px-1">
      <div className="w-9 h-9 rounded-full bg-[#272727] shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3.5 bg-[#272727] rounded w-full" />
        <div className="h-3 bg-[#272727] rounded w-2/3" />
      </div>
    </div>
  </div>
);

const PlaylistSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="w-full aspect-video bg-[#272727] rounded-xl" />
    <div className="h-3.5 bg-[#272727] rounded w-3/4" />
    <div className="h-3 bg-[#272727] rounded w-1/2" />
  </div>
);

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap
      ${
        active
          ? "border-white text-white"
          : "border-transparent text-[#aaa] hover:text-white"
      }`}
  >
    {children}
  </button>
);

const VideosTab = ({ userId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getAllVideos({ userId });
        setVideos(data?.videos || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        </div>
        <p className="text-white font-medium">No videos yet</p>
        <p className="text-[#aaa] text-sm mt-1">
          This channel hasn't uploaded any videos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
      {videos.map((video) => (
        <Link
          key={video._id}
          to={`/video/${video._id}`}
          className="flex flex-col gap-2 group"
        >
          <div className="relative w-full aspect-video bg-[#272727] rounded-xl overflow-hidden">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#555">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5 px-0.5">
            <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug">
              {video.title}
            </h3>
            <p className="text-[#aaa] text-xs">
              {formatViews(video.views)} views · {formatDate(video.createdAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const PlaylistsTab = ({ userId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getUserPlaylists(userId);
        setPlaylists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PlaylistSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
          </svg>
        </div>
        <p className="text-white font-medium">No playlists yet</p>
        <p className="text-[#aaa] text-sm mt-1">
          This channel hasn't created any playlists
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
      {playlists.map((playlist) => (
        <Link
          key={playlist._id}
          to={`/playlist/${playlist._id}`}
          className="flex flex-col gap-2 group"
        >
          <div className="relative w-full aspect-video bg-[#272727] rounded-xl overflow-hidden">
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#555">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded-tl-lg font-medium">
              {playlist.videos?.length || 0} videos
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                View playlist
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-white text-sm font-medium line-clamp-1">
              {playlist.name}
            </h3>
            <p className="text-[#aaa] text-xs mt-0.5 line-clamp-1">
              {playlist.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const AboutTab = ({ channel }) => (
  <div className="max-w-2xl flex flex-col gap-6">
    <div>
      <h3 className="text-white font-medium mb-3">Channel details</h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="#aaa"
            className="shrink-0"
          >
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          <span className="text-[#aaa]">
            {channel?.email || "No email provided"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="#aaa"
            className="shrink-0"
          >
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span className="text-[#aaa]">
            {formatViews(channel?.subscribersCount || 0)} subscribers
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="#aaa"
            className="shrink-0"
          >
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          <span className="text-[#aaa]">
            Subscribed to {formatViews(channel?.channelsSubscribedToCount || 0)}{" "}
            channels
          </span>
        </div>
      </div>
    </div>
  </div>
);

const Channel = () => {
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  const isOwner = user?.username === username;

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        const data = await getUserChannelProfile(username);
        setChannel(data);
        setSubscribed(data?.isSubscribed || false);
      } catch (err) {
        console.error("fetchChannel error:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [username]);

  const handleSubscribe = async () => {
    if (!user) return navigate("/login");
    try {
      setSubLoading(true);
      await toggleSubscription(channel._id);
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
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <div className="w-full h-32 sm:h-44 md:h-52 bg-[#272727] animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#272727] animate-pulse border-4 border-[#0f0f0f]" />
            <div className="flex flex-col gap-2 pb-2">
              <div className="h-6 bg-[#272727] rounded w-40 animate-pulse" />
              <div className="h-4 bg-[#272727] rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!channel) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="w-full h-32 sm:h-44 md:h-52 bg-[#1a1a1a] overflow-hidden">
        {channel.coverimage ? (
          <img
            src={channel.coverimage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-[#1a1a1a] to-[#272727]" />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between
                        gap-3 pt-3 pb-4 border-b border-[#272727] mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <div
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden
                            border-4 border-[#0f0f0f] shrink-0 bg-[#272727]
                            -mt-10 sm:-mt-14 relative z-10"
            >
              {channel.avatar ? (
                <img
                  src={channel.avatar}
                  alt={channel.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center
                                text-xl sm:text-2xl font-semibold uppercase
                                bg-linear-to-br from-orange-400 to-pink-600 text-white"
                >
                  {channel.username?.slice(0, 2)}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold text-white leading-tight truncate">
                {channel.fullname}
              </h1>
              <p className="text-[#aaa] text-sm">@{channel.username}</p>
              <p className="text-[#aaa] text-xs mt-0.5">
                {formatViews(channel.subscribersCount)} subscribers ·{" "}
                {formatViews(channel.channelsSubscribedToCount)} subscriptions
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isOwner ? (
              <>
                <Link
                  to="/upload"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1c62b9] hover:bg-[#1a56a0] text-white text-sm font-medium rounded-full transition"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                  </svg>
                  Upload
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-full transition"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-full transition"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                  Settings
                </Link>
              </>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className={`px-5 py-2 rounded-full text-sm font-medium transition disabled:opacity-60
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
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#272727] mb-6 overflow-x-auto scrollbar-none">
          <TabBtn
            active={activeTab === "videos"}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </TabBtn>
          <TabBtn
            active={activeTab === "playlists"}
            onClick={() => setActiveTab("playlists")}
          >
            Playlists
          </TabBtn>
          <TabBtn
            active={activeTab === "community"}
            onClick={() => setActiveTab("community")}
          >
            Community
          </TabBtn>
          <TabBtn
            active={activeTab === "about"}
            onClick={() => setActiveTab("about")}
          >
            About
          </TabBtn>
        </div>

        {/* Tab content */}
        <div className="pb-10">
          {activeTab === "videos" && <VideosTab userId={channel._id} />}
          {activeTab === "playlists" && <PlaylistsTab userId={channel._id} />}
          {activeTab === "community" && (
            <TweetSection channelUserId={channel._id} channelUser={channel} />
          )}
          {activeTab === "about" && <AboutTab channel={channel} />}
        </div>
      </div>
    </div>
  );
};

export default Channel;
