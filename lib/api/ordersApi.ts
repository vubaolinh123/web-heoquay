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
     * @param status - New status ("Chưa giao" | "Đang quay" | "Đang giao" | "Đã giao" | "Đã hủy")
     * @returns Promise<boolean> - True if successful
     * @throws Error if API returns error or network fails
     */
    updateOrderStatus: async (orderId: string, status: string): Promise<boolean> => {
        try {
            // Use Next.js API route as proxy to avoid CORS issues
            const response = await fetch("/api/orders/update-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId, status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể cập nhật trạng thái");
            }

            console.log("Update status result:", data);
            return true;
        } catch (error) {
            console.error("Update status error:", error);
            throw error;
        }
    },

    /**
     * Update order items (add/update products)
     * Uses Next.js API route as proxy to avoid CORS issues
     * @param orderId - Order ID (e.g., "WEB-SHDKADHS")
     * @param items - Array of items to update/add
     * @returns Promise<boolean> - True if successful
     * @throws Error if API returns error or network fails
     */
    updateOrderItems: async (orderId: string, items: OrderItemUpdate[]): Promise<boolean> => {
        try {
            const response = await fetch("/api/orders/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId, items }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể cập nhật đơn hàng");
            }

            console.log("Update order items result:", data);
            return true;
        } catch (error) {
            console.error("Update order items error:", error);
            throw error;
        }
    },

    /**
     * Send Zalo notification to customer
     * Uses Next.js API route as proxy to avoid CORS issues
     * @param orderId - Order ID (e.g., "WEB-SHDKADHS")
     * @param phoneNumber - Customer phone number
     * @returns Promise<boolean> - True if successful
     * @throws Error if API returns error or network fails
     */
    sendZaloToCustomer: async (orderId: string, phoneNumber: string): Promise<boolean> => {
        try {
            const response = await fetch("/api/orders/send-zalo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId, phone_number: phoneNumber }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Không thể gửi Zalo");
            }

            console.log("Send Zalo result:", data);
            return true;
        } catch (error) {
            console.error("Send Zalo error:", error);
            throw error;
        }
    },
};

/**
 * Order item update payload
 */
export interface OrderItemUpdate {
    code: string;    // "#H7", "#TP", etc
    name: string;    // Product name
    quantity: number;
    price: number;
}
