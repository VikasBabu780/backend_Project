import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getUserPlaylists,
  createPlaylist,
  addVideoToPlaylist,
} from "../../api/playlistAPI";
import toast from "react-hot-toast";

const PlaylistModal = ({ videoId, onClose }) => {
  const { user } = useContext(AuthContext);

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const data = await getUserPlaylists(user._id);
        setPlaylists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchPlaylists error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchPlaylists();
  }, [user]);

  const handleAddToPlaylist = async (playlistId) => {
    try {
      setAddingId(playlistId);
      await addVideoToPlaylist(playlistId, videoId);
      toast.success("Added to playlist");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add to playlist");
    } finally {
      setAddingId(null);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      toast.error("Playlist name is required");
      return;
    }
    if (!newPlaylist.description.trim()) {
      toast.error("Description is required");
      return;
    }
    try {
      setCreating(true);
      const created = await createPlaylist(newPlaylist);

      // Auto add video to newly created playlist
      await addVideoToPlaylist(created._id, videoId);

      toast.success(`Added to "${created.name}"`);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-[#1a1a1a] border border-[#272727] rounded-2xl w-full max-w-sm z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#272727]">
          <h2 className="text-white font-semibold">Save to playlist</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#272727] rounded-full text-[#aaa] hover:text-white transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Playlist list */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 animate-pulse"
                >
                  <div className="w-5 h-5 bg-[#272727] rounded" />
                  <div className="h-4 bg-[#272727] rounded flex-1" />
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-[#aaa] text-sm">No playlists yet</p>
              <p className="text-[#555] text-xs mt-0.5">Create one below</p>
            </div>
          ) : (
            <div>
              {playlists.map((playlist) => {
                const alreadyAdded = playlist.videos?.includes(videoId);
                return (
                  <button
                    key={playlist._id}
                    onClick={() =>
                      !alreadyAdded && handleAddToPlaylist(playlist._id)
                    }
                    disabled={addingId === playlist._id || alreadyAdded}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition
                      ${
                        alreadyAdded
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#272727] cursor-pointer"
                      }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition
                      ${
                        alreadyAdded
                          ? "bg-[#1c62b9] border-[#1c62b9]"
                          : "border-[#555]"
                      }`}
                    >
                      {alreadyAdded && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                      {addingId === playlist._id && (
                        <svg
                          className="animate-spin w-3 h-3 text-white"
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
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {playlist.name}
                      </p>
                      <p className="text-[#aaa] text-xs">
                        {playlist.videos?.length || 0} video
                        {playlist.videos?.length !== 1 ? "s" : ""}
                        {alreadyAdded && " · Already added"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create new playlist */}
        <div className="border-t border-[#272727]">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 text-[#3d9ae8] hover:bg-[#272727] transition text-sm font-medium"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Create new playlist
            </button>
          ) : (
            <div className="px-5 py-4 flex flex-col gap-3">
              <input
                type="text"
                value={newPlaylist.name}
                onChange={(e) =>
                  setNewPlaylist((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Playlist name"
                maxLength={100}
                autoFocus
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
              <input
                type="text"
                value={newPlaylist.description}
                onChange={(e) =>
                  setNewPlaylist((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Description"
                maxLength={300}
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylist({ name: "", description: "" });
                  }}
                  className="flex-1 py-2 bg-[#272727] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-full transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={creating || !newPlaylist.name.trim()}
                  className="flex-1 py-2 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 text-white text-sm font-medium rounded-full transition flex items-center justify-center gap-1.5"
                >
                  {creating ? (
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
                      Creating...
                    </>
                  ) : (
                    "Create & add"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
