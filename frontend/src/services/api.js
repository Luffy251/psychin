import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://psychin-backend.onrender.com";

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;