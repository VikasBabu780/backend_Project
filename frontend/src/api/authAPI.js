import apiClient from "./axios";

export const registerUser = async (formData) => {
  const res = await apiClient.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data; //  returns created user
};

export const login = async (credentials) => {
  const res = await apiClient.post("/auth/login", credentials);
  localStorage.setItem("accessToken", res.data.data.accessToken); // adjust path
};

export const logoutUser = async () => {
  const res = await apiClient.post("/users/logout");
  return res.data.data;
};

export const getCurrentUser = async () => {
  const res = await apiClient.get("/users/current-user");
  return res.data.data; //  returns user object directly
};

export const getUserChannelProfile = async (username) => {
  const res = await apiClient.get(`/users/c/${username}`);
  return res.data.data; // returns channel object
};

export const getWatchHistory = async () => {
  const res = await apiClient.get("/users/history");
  return res.data.data;
};

export const updateAccountDetails = async (data) => {
  const res = await apiClient.patch("/users/update-account", data);
  return res.data.data;
};

export const updateUserAvatar = async (formData) => {
  const res = await apiClient.patch("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateUserCoverImage = async (formData) => {
  const res = await apiClient.patch("/users/cover-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const changePassword = async (data) => {
  const res = await apiClient.post("/users/change-password", data);
  return res.data.data;
};
