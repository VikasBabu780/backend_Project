import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getChannelStats, getChannelVideos } from "../api/dashboardAPI";
import { deleteVideo, togglePublishStatus, updateVideo } from "../api/videoAPI";
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

// ─── Stat Card ─────────────
const StatCard = ({ icon, label, value, loading }) => (
  <div className="bg-[#1a1a1a] border border-[#272727] rounded-xl p-4 sm:p-5 flex items-center gap-4">
    <div className="w-11 h-11 rounded-full bg-[#272727] flex items-center justify-center shrink-0 text-[#aaa]">
      {icon}
    </div>
    <div>
      <p className="text-[#aaa] text-xs mb-1">{label}</p>
      {loading ? (
        <div className="h-6 w-16 bg-[#272727] rounded animate-pulse" />
      ) : (
        <p className="text-white text-xl font-semibold">{value}</p>
      )}
    </div>
  </div>
);

// ─── Edit Modal ───────────────
const EditModal = ({ video, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: video.title || "",
    description: video.description || "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    video.thumbnail || null,
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      if (thumbnail) data.append("thumbnail", thumbnail);

      const updated = await updateVideo(video._id, data);
      onSave(updated);
      toast.success("Video updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] border border-[#272727] rounded-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Edit video</h2>
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
          {/* Thumbnail */}
          <div>
            <label className="text-xs text-[#aaa] mb-1.5 block">
              Thumbnail
            </label>
            <div
              onClick={() => document.getElementById("editThumbnail").click()}
              className="relative w-full aspect-video rounded-xl overflow-hidden border border-dashed border-[#303030] hover:border-[#555] cursor-pointer bg-[#121212] transition"
            >
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                    <p className="text-white text-sm font-medium">
                      Change thumbnail
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#555] text-sm">
                  Click to upload thumbnail
                </div>
              )}
            </div>
            <input
              id="editThumbnail"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#aaa]">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#aaa]">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
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
            disabled={saving}
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

// ─── Delete Confirm Modal ─────────────
const DeleteModal = ({ video, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteVideo(video._id);
      onConfirm(video._id);
      toast.success("Video deleted successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] border border-[#272727] rounded-2xl w-full max-w-sm p-6 z-10">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#f87171">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </div>
        <h2 className="text-white font-semibold text-lg text-center mb-1">
          Delete video
        </h2>
        <p className="text-[#aaa] text-sm text-center mb-2">
          Are you sure you want to delete
        </p>
        <p className="text-white text-sm text-center font-medium mb-6 line-clamp-2 px-2">
          "{video.title}"
        </p>
        <p className="text-[#aaa] text-xs text-center mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-full transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-full transition flex items-center justify-center gap-2"
          >
            {deleting ? (
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
  );
};

// ─── Main Dashboard ──────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  // const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [editVideo, setEditVideo] = useState(null);
  const [deleteVideoData, setDeleteVideoData] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await getChannelStats();
        setStats(data);
      } catch (err) {
        console.error("fetchStats error:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const data = await getChannelVideos();
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchVideos error:", err);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchStats();
    fetchVideos();
  }, []);

  const handleTogglePublish = async (video) => {
    try {
      setTogglingId(video._id);
      await togglePublishStatus(video._id);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === video._id ? { ...v, isPublished: !v.isPublished } : v,
        ),
      );
      toast.success(
        `Video ${!video.isPublished ? "published" : "unpublished"} successfully`,
      );
    } catch (err) {
      toast.error(err.message || "Failed to toggle publish status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveEdit = (updatedVideo) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === updatedVideo._id ? { ...v, ...updatedVideo } : v,
      ),
    );
  };

  const handleConfirmDelete = (deletedId) => {
    setVideos((prev) => prev.filter((v) => v._id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-[#aaa] text-sm mt-0.5">
              Welcome back, {user?.fullname || user?.username}
            </p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1c62b9] hover:bg-[#1a56a0] text-white text-sm font-medium rounded-full transition w-fit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
            </svg>
            Upload video
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            loading={statsLoading}
            label="Total Videos"
            value={stats?.totalVideos || 0}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            }
          />
          <StatCard
            loading={statsLoading}
            label="Total Views"
            value={formatViews(stats?.totalViews)}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            }
          />
          <StatCard
            loading={statsLoading}
            label="Total Subscribers"
            value={formatViews(stats?.totalSubscribers)}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            }
          />
          <StatCard
            loading={statsLoading}
            label="Total Likes"
            value={formatViews(stats?.totalLikes)}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
            }
          />
        </div>

        {/* Videos table */}
        <div className="bg-[#1a1a1a] border border-[#272727] rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#272727] flex items-center justify-between">
            <h2 className="text-white font-medium">Your Videos</h2>
            <p className="text-[#aaa] text-sm">
              {videos.length} video{videos.length !== 1 ? "s" : ""}
            </p>
          </div>

          {videosLoading ? (
            <div className="p-6 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-32 sm:w-40 aspect-video bg-[#272727] rounded-lg shrink-0" />
                  <div className="flex-1 flex flex-col gap-2 pt-1">
                    <div className="h-4 bg-[#272727] rounded w-3/4" />
                    <div className="h-3 bg-[#272727] rounded w-1/2" />
                    <div className="h-3 bg-[#272727] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#aaa">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">No videos yet</p>
              <p className="text-[#aaa] text-sm mb-4">
                Upload your first video to get started
              </p>
              <Link
                to="/upload"
                className="px-5 py-2 bg-[#1c62b9] hover:bg-[#1a56a0] text-white text-sm font-medium rounded-full transition"
              >
                Upload video
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#272727]">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-4 hover:bg-[#222] transition"
                >
                  {/* Thumbnail */}
                  <Link to={`/video/${video._id}`} className="shrink-0">
                    <div className="relative w-full sm:w-36 aspect-video bg-[#272727] rounded-lg overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
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
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/video/${video._id}`}>
                      <h3 className="text-white text-sm font-medium line-clamp-2 hover:text-[#aaa] transition mb-1">
                        {video.title}
                      </h3>
                    </Link>
                    <p className="text-[#aaa] text-xs line-clamp-1 mb-2">
                      {video.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#aaa]">
                      <span>{formatViews(video.views)} views</span>
                      <span>·</span>
                      <span>{formatDate(video.createdAt)}</span>
                      {/* Published toggle */}
                      <button
                        onClick={() => handleTogglePublish(video)}
                        disabled={togglingId === video._id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition disabled:opacity-50
                          ${
                            video.isPublished
                              ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              : "bg-[#272727] text-[#aaa] hover:bg-[#3d3d3d]"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${video.isPublished ? "bg-green-400" : "bg-[#aaa]"}`}
                        />
                        {togglingId === video._id
                          ? "..."
                          : video.isPublished
                            ? "Published"
                            : "Private"}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditVideo(video)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#272727] hover:bg-[#3d3d3d] text-white text-xs font-medium rounded-full transition"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteVideoData(video)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-full transition"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editVideo && (
        <EditModal
          video={editVideo}
          onClose={() => setEditVideo(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete confirm modal */}
      {deleteVideoData && (
        <DeleteModal
          video={deleteVideoData}
          onClose={() => setDeleteVideoData(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default Dashboard;
