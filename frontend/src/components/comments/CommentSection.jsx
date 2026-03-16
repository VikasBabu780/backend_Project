import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../../api/commentAPI";
import { toggleCommentLike } from "../../api/likeAPI";

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

// Single comment component
const CommentItem = ({ comment, currentUser, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  const isOwner =
    currentUser?._id === comment.owner?._id ||
    currentUser?._id === comment.owner;

  const handleLike = async () => {
    if (!currentUser) return navigate("/login");
    try {
      await toggleCommentLike(comment._id);
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("comment like error:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    try {
      setUpdateLoading(true);
      await updateComment(comment._id, editText.trim());
      onUpdate(comment._id, editText.trim());
      setEditing(false);
    } catch (err) {
      console.error("update comment error:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <Link
        to={`/channel/${comment.owner?.username}`}
        className="shrink-0 mt-0.5"
      >
        {comment.owner?.avatar ? (
          <img
            src={comment.owner.avatar}
            alt={comment.owner.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center text-xs font-semibold uppercase text-white">
            {comment.owner?.username?.slice(0, 2)}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={`/channel/${comment.owner?.username}`}
            className="text-white text-xs font-medium hover:text-[#aaa] transition"
          >
            @{comment.owner?.username}
          </Link>
          <span className="text-[#aaa] text-xs">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        {/* Edit mode */}
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full bg-[#121212] border border-[#303030] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#1c62b9] resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={updateLoading || !editText.trim()}
                className="px-3 py-1.5 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 text-white text-xs font-medium rounded-full transition"
              >
                {updateLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditText(comment.comment);
                }}
                className="px-3 py-1.5 bg-[#272727] hover:bg-[#3d3d3d] text-white text-xs font-medium rounded-full transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-white text-sm leading-relaxed">
            {comment.comment}
          </p>
        )}

        {/* Like button */}
        {!editing && (
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition
                ${liked ? "text-white" : "text-[#aaa] hover:text-white"}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          </div>
        )}
      </div>

      {/* 3-dot menu — only for comment owner */}
      {isOwner && !editing && (
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="p-1 hover:bg-[#272727] rounded-full text-[#aaa] hover:text-white transition"
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
              <div className="absolute right-0 mt-1 w-32 bg-[#282828] border border-[#3d3d3d] rounded-lg overflow-hidden z-50 shadow-xl">
                <button
                  onClick={() => {
                    setEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-[#3d3d3d] transition"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(comment._id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-[#3d3d3d] transition"
                >
                  <svg
                    width="14"
                    height="14"
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

// Skeleton
const CommentSkeleton = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-[#272727] shrink-0" />
    <div className="flex-1">
      <div className="h-3 bg-[#272727] rounded w-1/4 mb-2" />
      <div className="h-3 bg-[#272727] rounded w-full mb-1" />
      <div className="h-3 bg-[#272727] rounded w-3/4" />
    </div>
  </div>
);

// Main CommentSection
const CommentSection = ({ videoId }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [focused, setFocused] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const LIMIT = 10;

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await getVideoComments(videoId, {
        page: pageNum,
        limit: LIMIT,
      });
      const list = Array.isArray(data) ? data : data?.comments || [];

      setComments((prev) => (append ? [...prev, ...list] : list));
      setHasMore(list.length === LIMIT);
    } catch (err) {
      console.error("fetchComments error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
    setPage(1);
  }, [videoId]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchComments(nextPage, true);
  };

  const handleSubmit = async () => {
    if (!user) return navigate("/login");
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const created = await addComment(videoId, newComment.trim());

      // Optimistically add to top with owner info from current user
      const optimistic = {
        ...created,
        owner: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      };

      setComments((prev) => [optimistic, ...prev]);
      setNewComment("");
      setFocused(false);
    } catch (err) {
      console.error("addComment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("deleteComment error:", err);
    }
  };

  const handleUpdate = (commentId, newText) => {
    setComments((prev) =>
      prev.map((c) => (c._id === commentId ? { ...c, comment: newText } : c)),
    );
  };

  return (
    <div>
      {/* Header */}
      <h3 className="text-white font-medium text-base mb-4">
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
      </h3>

      {/* Add comment */}
      <div className="flex gap-3 mb-6">
        {/* Current user avatar */}
        <div className="shrink-0 mt-1">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center text-xs font-semibold uppercase text-white">
              {user?.username?.slice(0, 2) || "?"}
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={user ? "Add a comment..." : "Sign in to comment"}
            readOnly={!user}
            onClick={() => !user && navigate("/login")}
            className="w-full bg-transparent border-b border-[#303030] focus:border-white text-white text-sm pb-1 outline-none placeholder-[#aaa] transition-colors cursor-text"
          />

          {focused && user && (
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setFocused(false);
                  setNewComment("");
                }}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-[#272727] rounded-full transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2 text-sm font-medium bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition"
              >
                {submitting ? "Posting..." : "Comment"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="flex flex-col gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CommentSkeleton key={i} />)
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={user}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-[#aaa] text-sm">No comments yet</p>
            <p className="text-[#555] text-xs mt-1">Be the first to comment</p>
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mt-6 w-full py-2.5 text-sm font-medium text-white bg-[#272727] hover:bg-[#3d3d3d] disabled:opacity-50 rounded-full transition"
        >
          {loadingMore ? (
            <span className="flex items-center justify-center gap-2">
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
            </span>
          ) : (
            "Load more comments"
          )}
        </button>
      )}
    </div>
  );
};

export default CommentSection;
