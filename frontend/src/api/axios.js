import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

//  This interceptor re-throws errors with the backend message attached
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract exact message from your ApiError response
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    error.message = message; //  overwrite so catch blocks can use err.message directly
    return Promise.reject(error);
  },
);

export default apiClient;
