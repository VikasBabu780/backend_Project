import apiClient from "./axios";

export const getAllVideos = async (params = {}) => {
  const res = await apiClient.get("/videos", { params });
  return res.data.data; // returns { videos, totalVideos, page, limit }
};

export const getVideoById = async (videoId) => {
  const res = await apiClient.get(`/videos/${videoId}`);
  return res.data.data; // returns video object
};

export const publishVideo = async (formData) => {
  const res = await apiClient.post("/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateVideo = async (videoId, formData) => {
  const res = await apiClient.patch(`/videos/${videoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const deleteVideo = async (videoId) => {
  const res = await apiClient.delete(`/videos/${videoId}`);
  return res.data.data;
};

export const togglePublishStatus = async (videoId) => {
  const res = await apiClient.patch(`/videos/toggle/publish/${videoId}`);
  return res.data.data;
};
