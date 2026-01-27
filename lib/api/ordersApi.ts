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

    /**
     * Update order status
     * @param orderId - Order ID (e.g., "web-83234742")
     * @param status - New status ("Chưa giao" | "Đang giao" | "Đã giao" | "Đã hủy")
     * @returns Promise<boolean> - True if successful
     * @throws Error if API returns error or network fails
     */
    updateOrderStatus: async (orderId: string, status: string): Promise<boolean> => {
        const response = await fetch(
            "https://asia-82692522.n8nhosting.cloud/webhook/api/v1/heoquay/orders/update-status",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId, status }),
            }
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Không thể cập nhật trạng thái");
        }

        return true;
    },
};
