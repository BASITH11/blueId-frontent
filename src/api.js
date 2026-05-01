// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "192.168.1.100:8000", // Laravel backend
  withCredentials: true,            // needed if using Sanctum
});

export default api;
