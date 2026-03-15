import apiClient from "./axios";

export const getVideoComments = async (videoId, params = {}) => {
  const res = await apiClient.get(`/comments/${videoId}`, { params });
  return res.data.data; //  returns comments array
};

export const addComment = async (videoId, comment) => {
  const res = await apiClient.post(`/comments/${videoId}`, { comment });
  return res.data.data;
};

export const updateComment = async (commentId, comment) => {
  const res = await apiClient.patch(`/comments/c/${commentId}`, { comment });
  return res.data.data;
};

export const deleteComment = async (commentId) => {
  const res = await apiClient.delete(`/comments/c/${commentId}`);
  return res.data.data;
};
