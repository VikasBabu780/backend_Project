import apiClient from "./axios";

export const createTweet = async (content) => {
  const res = await apiClient.post("/tweets", { content });
  return res.data.data;
};

export const getUserTweets = async (userId) => {
  const res = await apiClient.get(`/tweets/user/${userId}`);
  return res.data.data;
};

export const updateTweet = async (tweetId, content) => {
  const res = await apiClient.patch(`/tweets/${tweetId}`, { content });
  return res.data.data;
};

export const deleteTweet = async (tweetId) => {
  const res = await apiClient.delete(`/tweets/${tweetId}`);
  return res.data.data;
};
