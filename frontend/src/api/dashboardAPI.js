import apiClient from "./axios";

export const getChannelStats = async () => {
  const res = await apiClient.get("/dashboard/stats");
  return res.data.data; // returns { totalVideos, totalViews, totalSubscribers, totalLikes }
};

export const getChannelVideos = async () => {
  const res = await apiClient.get("/dashboard/videos");
  return res.data.data; // returns videos array
};
