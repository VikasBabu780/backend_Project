import apiClient from "./axios";

export const createPlaylist = async (data) => {
  const res = await apiClient.post("/playlist", data);
  return res.data.data;
};

export const getUserPlaylists = async (userId) => {
  const res = await apiClient.get(`/playlist/user/${userId}`);
  return res.data.data;
};

export const getPlaylistById = async (playlistId) => {
  const res = await apiClient.get(`/playlist/${playlistId}`);
  return res.data.data;
};

export const addVideoToPlaylist = async (playlistId, videoId) => {
  const res = await apiClient.patch(`/playlist/add/${videoId}/${playlistId}`);
  return res.data.data;
};

export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  const res = await apiClient.patch(
    `/playlist/remove/${videoId}/${playlistId}`,
  );
  return res.data.data;
};

export const deletePlaylist = async (playlistId) => {
  const res = await apiClient.delete(`/playlist/${playlistId}`);
  return res.data.data;
};

export const updatePlaylist = async (playlistId, data) => {
  const res = await apiClient.patch(`/playlist/${playlistId}`, data);
  return res.data.data;
};
