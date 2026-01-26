import axios from "axios";

// Use local API route as proxy - external API returns 403 for direct browser calls
const BASE_URL = "/api";


// Create axios instance with default config
const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // You can add logging or modify request here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for centralized error handling
axiosClient.interceptors.response.use(
    (response) => {
        // Return the data directly from response
        return response.data;
    },
    (error) => {
        // Handle different error types
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || "Có lỗi xảy ra từ server";
            console.error("API Error:", message);
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Request was made but no response
            console.error("Network Error:", error.message);
            return Promise.reject(new Error("Không thể kết nối đến server. Vui lòng kiểm tra mạng."));
        } else {
            // Error in request config
            console.error("Request Error:", error.message);
            return Promise.reject(new Error("Có lỗi xảy ra khi gửi yêu cầu."));
        }
    }
);

export default axiosClient;
