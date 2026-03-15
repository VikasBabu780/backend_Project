import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getSubscribedChannels } from "../api/subscriptionAPI";
import { toggleSubscription } from "../api/subscriptionAPI";
import { getAllVideos } from "../api/videoAPI";
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

// ─── Skeletons ─────────────────
const ChannelSkeleton = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-14 h-14 rounded-full bg-[#272727] shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-4 bg-[#272727] rounded w-1/3" />
      <div className="h-3 bg-[#272727] rounded w-1/4" />
    </div>
    <div className="w-24 h-8 bg-[#272727] rounded-full shrink-0" />
  </div>
);

const VideoSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="w-full aspect-video bg-[#272727] rounded-xl" />
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#272727] shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3.5 bg-[#272727] rounded w-full" />
        <div className="h-3 bg-[#272727] rounded w-2/3" />
      </div>
    </div>
  </div>
);

// ─── Tab Button ────────────────
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

// ─── Channel Card ──────────────────
const ChannelCard = ({ channel, onUnsubscribe }) => {
  const [unsubLoading, setUnsubLoading] = useState(false);

  const handleUnsubscribe = async () => {
    try {
      setUnsubLoading(true);
      await toggleSubscription(channel._id);
      onUnsubscribe(channel._id);
      toast.success(`Unsubscribed from ${channel.username}`);
    } catch (err) {
      toast.error(err.message || "Failed to unsubscribe");
    } finally {
      setUnsubLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-[#1a1a1a] transition border-b border-[#272727] last:border-0">
      {/* Avatar */}
      <Link to={`/channel/${channel.username}`} className="shrink-0">
        {channel.avatar ? (
          <img
            src={channel.avatar}
            alt={channel.username}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br from-orange-400 to-pink-600 flex items-center justify-center text-sm font-semibold uppercase text-white">
            {channel.username?.slice(0, 2)}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/channel/${channel.username}`}
          className="text-white text-sm font-medium hover:text-[#aaa] transition block truncate"
        >
          {channel.fullname || channel.username}
        </Link>
        <p className="text-[#aaa] text-xs mt-0.5 truncate">
          @{channel.username}
        </p>
      </div>

      {/* Unsubscribe button */}
      <button
        onClick={handleUnsubscribe}
        disabled={unsubLoading}
        className="shrink-0 px-4 py-2 bg-[#272727] hover:bg-[#3d3d3d] disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-full transition"
      >
        {unsubLoading ? "..." : "Unsubscribe"}
      </button>
    </div>
  );
};

// ─── Main Subscriptions Page ───────────────
const Subscriptions = () => {
  const { user } = useContext(AuthContext);

  const [channels, setChannels] = useState([]);
  const [latestVideos, setLatestVideos] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("latest");

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setChannelsLoading(true);
        const data = await getSubscribedChannels(user._id);

        // console.log("subscribed channels:", data);
        setChannels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchChannels error:", err);
        setChannels([]);
      } finally {
        setChannelsLoading(false);
      }
    };

    if (user?._id) fetchChannels();
  }, [user]);

  useEffect(() => {
    const fetchLatestVideos = async () => {
      try {
        setVideosLoading(true);
        const data = await getAllVideos({
          limit: 20,
          sortBy: "createdAt",
          sortType: "desc",
        });
        setLatestVideos(data?.videos || []);
      } catch (err) {
        console.error("fetchLatestVideos error:", err);
        setLatestVideos([]);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchLatestVideos();
  }, []);

  const handleUnsubscribe = (channelId) => {
    setChannels((prev) => prev.filter((c) => c._id !== channelId));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold">Subscriptions</h1>
          {!channelsLoading && (
            <p className="text-[#aaa] text-sm mt-1">
              {channels.length} channel{channels.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#272727] mb-6 overflow-x-auto scrollbar-none">
          <TabBtn
            active={activeTab === "latest"}
            onClick={() => setActiveTab("latest")}
          >
            Latest
          </TabBtn>
          <TabBtn
            active={activeTab === "channels"}
            onClick={() => setActiveTab("channels")}
          >
            Manage channels
          </TabBtn>
        </div>

        {/* ── Latest videos tab ───────────── */}
        {activeTab === "latest" && (
          <div>
            {videosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <VideoSkeleton key={i} />
                ))}
              </div>
            ) : latestVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                </div>
                <p className="text-white font-medium">No videos yet</p>
                <p className="text-[#aaa] text-sm">
                  Subscribe to channels to see their latest videos here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
                {latestVideos.map((video) => (
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Manage channels tab ────────────── */}
        {activeTab === "channels" && (
          <div>
            {channelsLoading ? (
              <div className="bg-[#1a1a1a] border border-[#272727] rounded-2xl overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ChannelSkeleton key={i} />
                ))}
              </div>
            ) : channels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <p className="text-white font-medium">
                  Not subscribed to anyone yet
                </p>
                <p className="text-[#aaa] text-sm">
                  Subscribe to channels to see them here
                </p>
                <Link
                  to="/"
                  className="mt-2 px-5 py-2 bg-[#1c62b9] hover:bg-[#1a56a0] text-white text-sm font-medium rounded-full transition"
                >
                  Browse videos
                </Link>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-[#272727] rounded-2xl overflow-hidden">
                {channels.map((channel) => (
                  <ChannelCard
                    key={channel._id}
                    channel={channel}
                    onUnsubscribe={handleUnsubscribe}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
