import apiClient from "./axios";

export const toggleVideoLike = async (videoId) => {
  const res = await apiClient.post(`/likes/toggle/v/${videoId}`);
  return res.data.data;
};

export const toggleCommentLike = async (commentId) => {
  const res = await apiClient.post(`/likes/toggle/c/${commentId}`);
  return res.data.data;
};

export const toggleTweetLike = async (tweetId) => {
  const res = await apiClient.post(`/likes/toggle/t/${tweetId}`);
  return res.data.data;
};

export const getLikedVideos = async () => {
  const res = await apiClient.get("/likes/videos");
  return res.data.data; // returns array of liked video objects
};
