import apiClient from "./axios";

//  /c/ → /channel/ to match backend route
export const toggleSubscription = async (channelId) => {
  const res = await apiClient.post(`/subscriptions/channel/${channelId}`);
  return res.data.data;
};

//  /c/ → /channel/
export const getUserChannelSubscribers = async (channelId) => {
  const res = await apiClient.get(`/subscriptions/channel/${channelId}`);
  return res.data.data;
};

//  /u/ → /user/
export const getSubscribedChannels = async (subscriberId) => {
  const res = await apiClient.get(`/subscriptions/user/${subscriberId}`);
  return res.data.data;
};
