import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api", // Backend base URL
});

// Automatically attach token with each request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // token saved after login
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
