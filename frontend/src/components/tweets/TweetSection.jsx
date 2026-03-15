import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  getUserTweets,
  createTweet,
  updateTweet,
  deleteTweet,
} from "../../api/tweetAPI";
import { toggleTweetLike } from "../../api/likeAPI";
import toast from "react-hot-toast";

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

// ─── Skeleton ────────
const TweetSkeleton = () => (
  <div className="flex gap-3 animate-pulse p-4 border-b border-[#272727]">
    <div className="w-9 h-9 rounded-full bg-[#272727] shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-3.5 bg-[#272727] rounded w-1/4" />
      <div className="h-3.5 bg-[#272727] rounded w-full" />
      <div className="h-3.5 bg-[#272727] rounded w-3/4" />
    </div>
  </div>
);

// ─── Single Tweet ──────────
const TweetItem = ({ tweet, currentUser, channelUser, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.content);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  const isOwner =
    currentUser?._id === tweet.owner?._id || currentUser?._id === tweet.owner;

  const handleLike = async () => {
    if (!currentUser) return navigate("/login");
    try {
      await toggleTweetLike(tweet._id);
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("tweet like error:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    try {
      setUpdateLoading(true);
      await updateTweet(tweet._id, editText.trim());
      onUpdate(tweet._id, editText.trim());
      setEditing(false);
      toast.success("Tweet updated");
    } catch (err) {
      toast.error(err.message || "Failed to update tweet");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTweet(tweet._id);
      onDelete(tweet._id);
      toast.success("Tweet deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete tweet");
    }
  };

  return (
    <div className="flex gap-3 px-4 py-4 border-b border-[#272727] group hover:bg-[#1a1a1a] transition">
      {/* Avatar */}
      <div className="shrink-0">
        {channelUser?.avatar ? (
          <img
            src={channelUser.avatar}
            alt={channelUser.username}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-pink-600 flex items-center justify-center text-xs font-semibold uppercase text-white">
            {channelUser?.username?.slice(0, 2)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-white text-sm font-medium">
            {channelUser?.fullname || channelUser?.username}
          </span>
          <span className="text-[#aaa] text-xs">@{channelUser?.username}</span>
          <span className="text-[#555] text-xs">·</span>
          <span className="text-[#aaa] text-xs">
            {formatDate(tweet.createdAt)}
          </span>
        </div>

        {/* Edit mode */}
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              maxLength={280}
              className="w-full bg-[#121212] border border-[#303030] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#1c62b9] resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[#555] text-xs">{editText.length}/280</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditText(tweet.content);
                  }}
                  className="px-3 py-1.5 text-xs text-white hover:bg-[#272727] rounded-full transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateLoading || !editText.trim()}
                  className="px-3 py-1.5 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 text-white text-xs font-medium rounded-full transition"
                >
                  {updateLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white text-sm leading-relaxed whitespace-pre-line">
            {tweet.content}
          </p>
        )}

        {/* Like button */}
        {!editing && (
          <div className="flex items-center gap-4 mt-2.5">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition
                ${liked ? "text-red-400" : "text-[#aaa] hover:text-red-400"}`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          </div>
        )}
      </div>

      {/* 3-dot menu — owner only */}
      {isOwner && !editing && (
        <div className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="p-1.5 hover:bg-[#272727] rounded-full text-[#aaa] hover:text-white transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-32 bg-[#282828] border border-[#3d3d3d] rounded-xl overflow-hidden z-50 shadow-xl">
                <button
                  onClick={() => {
                    setEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-[#3d3d3d] transition"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-[#3d3d3d] transition"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main TweetSection ───────
const TweetSection = ({ channelUserId, channelUser }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newTweet, setNewTweet] = useState("");
  const [focused, setFocused] = useState(false);

  const isOwner = user?._id === channelUserId;
  const MAX = 280;

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setLoading(true);
        const data = await getUserTweets(channelUserId);
        setTweets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchTweets error:", err);
        setTweets([]);
      } finally {
        setLoading(false);
      }
    };
    if (channelUserId) fetchTweets();
  }, [channelUserId]);

  const handleSubmit = async () => {
    if (!user) return navigate("/login");
    if (!newTweet.trim()) return;
    if (newTweet.length > MAX) {
      toast.error(`Tweet must be under ${MAX} characters`);
      return;
    }
    try {
      setSubmitting(true);
      const created = await createTweet(newTweet.trim());
      setTweets((prev) => [created, ...prev]);
      setNewTweet("");
      setFocused(false);
      toast.success("Tweet posted");
    } catch (err) {
      toast.error(err.message || "Failed to post tweet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (tweetId) => {
    setTweets((prev) => prev.filter((t) => t._id !== tweetId));
  };

  const handleUpdate = (tweetId, newContent) => {
    setTweets((prev) =>
      prev.map((t) => (t._id === tweetId ? { ...t, content: newContent } : t)),
    );
  };

  const remaining = MAX - newTweet.length;

  return (
    <div className="bg-[#0f0f0f] text-white">
      {/* Compose box — only shown on own channel */}
      {isOwner && (
        <div className="px-4 py-4 border-b border-[#272727]">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-pink-600 flex items-center justify-center text-xs font-semibold uppercase text-white">
                  {user?.username?.slice(0, 2)}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex-1">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                onFocus={() => setFocused(true)}
                placeholder="Share something with your subscribers..."
                rows={focused ? 3 : 1}
                maxLength={MAX}
                className="w-full bg-transparent border-b border-[#303030] focus:border-white text-white text-sm pb-2 outline-none placeholder-[#aaa] resize-none transition-all"
              />

              {focused && (
                <div className="flex items-center justify-between mt-3">
                  {/* Character counter */}
                  <span
                    className={`text-xs font-medium ${
                      remaining < 20
                        ? remaining < 0
                          ? "text-red-400"
                          : "text-yellow-400"
                        : "text-[#aaa]"
                    }`}
                  >
                    {remaining}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFocused(false);
                        setNewTweet("");
                      }}
                      className="px-4 py-2 text-sm font-medium text-white hover:bg-[#272727] rounded-full transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !newTweet.trim() || remaining < 0}
                      className="px-5 py-2 text-sm font-medium bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
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
                          Posting...
                        </>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tweets list */}
      {loading ? (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <TweetSkeleton key={i} />
          ))}
        </div>
      ) : tweets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-14 h-14 rounded-full bg-[#272727] flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#aaa">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          </div>
          <p className="text-white font-medium text-sm">No posts yet</p>
          <p className="text-[#aaa] text-xs mt-1">
            {isOwner
              ? "Share something with your subscribers"
              : "This channel hasn't posted anything yet"}
          </p>
        </div>
      ) : (
        <div>
          {tweets.map((tweet) => (
            <TweetItem
              key={tweet._id}
              tweet={tweet}
              currentUser={user}
              channelUser={channelUser}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TweetSection;
