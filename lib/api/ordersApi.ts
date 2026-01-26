import { ApiResponse, ApiOrder } from "./types";
import { getStoredToken } from "@/contexts";

/**
 * Get auth headers with token
 */
function getHeaders(): HeadersInit {
    const token = getStoredToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}

/**
 * Orders API endpoints
 */
export const ordersApi = {
    /**
     * Fetch all orders from the API
     * @returns Promise<ApiOrder[]> - Array of orders
     * @throws Error if API returns error or network fails
     */
    getOrders: async (): Promise<ApiOrder[]> => {
        const response = await fetch("/api/orders", {
            headers: getHeaders(),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to fetch orders");
        }

        const data: ApiResponse<ApiOrder[]> = await response.json();

        // Check for API-level errors
        if (data.error !== "0") {
            throw new Error(`API Error: ${data.error}`);
        }

        // Reverse order so newest items appear first
        return data.data.reverse();
    },
};
