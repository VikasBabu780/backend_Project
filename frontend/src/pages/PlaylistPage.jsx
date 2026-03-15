import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getPlaylistById,
  deletePlaylist,
  updatePlaylist,
  removeVideoFromPlaylist,
} from "../api/playlistAPI";
import toast from "react-hot-toast";

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
const SkeletonRow = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-8 text-center text-[#555] text-sm pt-2 shrink-0">·</div>
    <div className="w-36 aspect-video bg-[#272727] rounded-lg shrink-0" />
    <div className="flex flex-col gap-2 flex-1 pt-1">
      <div className="h-3.5 bg-[#272727] rounded w-3/4" />
      <div className="h-3 bg-[#272727] rounded w-1/3" />
    </div>
  </div>
);

// ─── Edit Playlist Modal ──────────────
const EditPlaylistModal = ({ playlist, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: playlist.name || "",
    description: playlist.description || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Playlist name is required");
      return;
    }
    try {
      setSaving(true);
      const updated = await updatePlaylist(playlist._id, form);
      onSave(updated);
      toast.success("Playlist updated");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update playlist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-[#272727] rounded-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Edit playlist</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#272727] rounded-full text-[#aaa] hover:text-white transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#aaa]">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Playlist name"
              maxLength={100}
              className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#aaa]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Playlist description"
              rows={3}
              maxLength={300}
              className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-full transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="flex-1 py-2.5 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 text-white text-sm font-medium rounded-full transition flex items-center justify-center gap-2"
          >
            {saving ? (
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
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Playlist Page ──────────────
const PlaylistPage = () => {
  const { playlistId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPlaylist, setDeletingPlaylist] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        const data = await getPlaylistById(playlistId);
        setPlaylist(data);
      } catch (err) {
        console.error("fetchPlaylist error:", err);
        toast.error("Playlist not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [playlistId]);

  const isOwner =
    user?._id === playlist?.owner?._id || user?._id === playlist?.owner;

  const handleDeletePlaylist = async () => {
    try {
      setDeletingPlaylist(true);
      await deletePlaylist(playlistId);
      toast.success("Playlist deleted");
      navigate(-1);
    } catch (err) {
      toast.error(err.message || "Failed to delete playlist");
    } finally {
      setDeletingPlaylist(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      setRemovingId(videoId);
      await removeVideoFromPlaylist(playlistId, videoId);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
      toast.success("Video removed from playlist");
    } catch (err) {
      toast.error(err.message || "Failed to remove video");
    } finally {
      setRemovingId(null);
    }
  };

  const handleEditSave = (updated) => {
    setPlaylist((prev) => ({ ...prev, ...updated }));
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Left sidebar skeleton */}
          <div className="lg:w-72 xl:w-80 shrink-0 animate-pulse">
            <div className="w-full aspect-video bg-[#272727] rounded-2xl mb-4" />
            <div className="h-6 bg-[#272727] rounded w-3/4 mb-2" />
            <div className="h-4 bg-[#272727] rounded w-1/2 mb-1" />
            <div className="h-4 bg-[#272727] rounded w-1/3" />
          </div>
          {/* Right list skeleton */}
          <div className="flex-1 flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) return null;

  const videos = playlist.videos || [];
  const firstThumb = videos[0]?.thumbnail;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* ── LEFT — Playlist info sidebar ──────────── */}
        <div className="lg:w-72 xl:w-80 shrink-0">
          <div className="lg:sticky lg:top-20">
            {/* Cover */}
            <div className="w-full aspect-video bg-[#272727] rounded-2xl overflow-hidden mb-4">
              {firstThumb ? (
                <img
                  src={firstThumb}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#555]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                  </svg>
                  <p className="text-sm">No videos</p>
                </div>
              )}
            </div>

            {/* Name + description */}
            <h1 className="text-white text-xl font-semibold mb-1">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-[#aaa] text-sm mb-3 leading-relaxed">
                {playlist.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-[#aaa]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <Link
                  to={`/channel/${playlist.owner?.username}`}
                  className="hover:text-white transition"
                >
                  {playlist.owner?.username}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#aaa]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
                <span>
                  {videos.length} video{videos.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Play all button */}
            {videos.length > 0 && (
              <Link
                to={`/video/${videos[0]._id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition mb-3"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play all
              </Link>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu((p) => !p)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-full transition"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  More options
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute top-full mt-1 left-0 right-0 bg-[#282828] border border-[#3d3d3d] rounded-xl overflow-hidden z-50 shadow-xl">
                      <button
                        onClick={() => {
                          setShowEditModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#3d3d3d] transition"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                        Edit playlist
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#3d3d3d] transition"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                        Delete playlist
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT — Video list ───────────── */}
        <div className="flex-1 min-w-0">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#272727] flex items-center justify-center mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#aaa">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </div>
              <p className="text-white font-medium">
                No videos in this playlist
              </p>
              <p className="text-[#aaa] text-sm">
                Add videos while watching them
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {videos.map((video, index) => (
                <div
                  key={video._id}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#1a1a1a] transition group"
                >
                  {/* Index number */}
                  <span className="text-[#aaa] text-sm w-6 text-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Thumbnail */}
                  <Link
                    to={`/video/${video._id}`}
                    className="relative w-36 sm:w-40 aspect-video bg-[#272727] rounded-lg overflow-hidden shrink-0"
                  >
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="#555"
                        >
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/video/${video._id}`}>
                      <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug hover:text-[#aaa] transition">
                        {video.title}
                      </h3>
                    </Link>
                    <p className="text-[#aaa] text-xs mt-0.5">
                      {video.owner?.username}
                    </p>
                    <p className="text-[#aaa] text-xs">
                      {formatViews(video.views || 0)} views ·{" "}
                      {formatDate(video.createdAt)}
                    </p>
                  </div>

                  {/* Remove button — owner only */}
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveVideo(video._id)}
                      disabled={removingId === video._id}
                      className="shrink-0 p-2 hover:bg-[#272727] rounded-full text-[#aaa] hover:text-red-400 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Remove from playlist"
                    >
                      {removingId === video._id ? (
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
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-[#1a1a1a] border border-[#272727] rounded-2xl w-full max-w-sm p-6 z-10">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f87171">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg text-center mb-1">
              Delete playlist
            </h2>
            <p className="text-[#aaa] text-sm text-center mb-2">
              Are you sure you want to delete
            </p>
            <p className="text-white text-sm text-center font-medium mb-6 px-2">
              "{playlist.name}"
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-full transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlaylist}
                disabled={deletingPlaylist}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-full transition flex items-center justify-center gap-2"
              >
                {deletingPlaylist ? (
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
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
